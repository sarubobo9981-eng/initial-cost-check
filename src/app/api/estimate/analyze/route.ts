import { NextRequest, NextResponse } from "next/server";
import { OcrNotConfiguredError } from "@/lib/ocr/ocrService";
import { normalizeEstimateFiles } from "@/lib/estimate/normalizeEstimateFiles";
import { extractEstimateContent } from "@/lib/estimate/extractEstimateContent";
import { parseEstimateWithAI } from "@/lib/estimate/parseEstimateWithAI";
import { getPdfPageCount } from "@/lib/estimate/pdfPageCount";
import { deleteBlobsSafely } from "@/lib/estimate/blobCleanup";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  EstimateBlobFile,
  ESTIMATE_ACCEPTED_MIME_TYPES,
  ESTIMATE_ACCEPTED_PDF_TYPE,
  MAX_ESTIMATE_FILES,
  MAX_ESTIMATE_FILE_SIZE_BYTES,
  MAX_PDF_PAGES,
  MAX_TOTAL_UPLOAD_BYTES,
} from "@/types/estimateFile";

export const runtime = "nodejs";
export const maxDuration = 60;

// 1つのIPから短時間に大量解析されないようにする簡易レート制限
const ANALYZE_RATE_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 }; // 10分間に8回まで

interface AnalyzeRequestBody {
  files: EstimateBlobFile[];
}

function isValidBlobFile(value: unknown): value is EstimateBlobFile {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.url === "string" &&
    v.url.startsWith("https://") &&
    typeof v.contentType === "string" &&
    typeof v.name === "string" &&
    typeof v.size === "number"
  );
}

/**
 * 見積書解析API
 *
 * クライアントはファイル本体ではなく、Vercel Blobへ直接アップロード済みのURL情報
 * （{ url, contentType, name, size }[]）だけを送信する
 * （Vercel Functionsのリクエストボディ上限(4.5MB)を回避するため）。
 * normalizeEstimateFiles（Blobから取得） → extractEstimateContent → parseEstimateWithAI
 * という共通パイプラインで処理する。入力方式による分岐はこのファイルより下層で行わない。
 *
 * 注意: 見積書画像・PDF本文・Claudeのレスポンス全文・Blob URL・内部エラー詳細は
 * ログやレスポンスに出力しない（個人情報を含む可能性があるため、また内部実装の詳細を
 * 利用者に見せないため）。
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(`estimate-analyze:${clientIp}`, ANALYZE_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "しばらく時間を空けてもう一度お試しください。" },
      {
        status: 429,
        headers: rateLimitResult.retryAfterSeconds
          ? { "Retry-After": String(rateLimitResult.retryAfterSeconds) }
          : undefined,
      }
    );
  }

  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が正しくありません。" }, { status: 400 });
  }

  const rawFiles = Array.isArray(body?.files) ? body.files : [];
  if (rawFiles.length === 0) {
    return NextResponse.json({ error: "ファイルが見つかりません。" }, { status: 400 });
  }
  if (!rawFiles.every(isValidBlobFile)) {
    return NextResponse.json({ error: "ファイル情報が正しくありません。" }, { status: 400 });
  }
  const files = rawFiles as EstimateBlobFile[];

  // 以降、アップロード済みBlobを参照するため、途中で処理を打ち切る場合も
  // 必ず削除できるよう finally で後始末する。
  const blobUrls = files.map((file) => file.url);

  try {
    if (files.length > MAX_ESTIMATE_FILES) {
      return NextResponse.json(
        { error: `アップロードできるファイルは最大${MAX_ESTIMATE_FILES}枚までです。` },
        { status: 400 }
      );
    }

    // Phase A: クライアント申告のメタデータでの早期検証（あくまで簡易チェック）
    let declaredTotal = 0;
    for (const file of files) {
      if (!ESTIMATE_ACCEPTED_MIME_TYPES.includes(file.contentType)) {
        return NextResponse.json(
          { error: "対応していないファイル形式が含まれています。JPEG・PNG・PDFのいずれかをご利用ください。" },
          { status: 400 }
        );
      }
      if (file.size > MAX_ESTIMATE_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "ファイルサイズが大きすぎるものが含まれています（1ファイル10MBまで）。" },
          { status: 400 }
        );
      }
      declaredTotal += file.size;
    }
    if (declaredTotal > MAX_TOTAL_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "アップロードの合計サイズが大きすぎます（合計30MBまで）。ファイル数を減らしてお試しください。" },
        { status: 400 }
      );
    }

    // Blobから実データを取得
    const normalized = await normalizeEstimateFiles(files);

    // Phase B: 実データでの再検証（クライアント申告のsizeは信用しない）
    let actualTotal = 0;
    for (const file of normalized) {
      if (file.buffer.byteLength > MAX_ESTIMATE_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "ファイルサイズが大きすぎるものが含まれています（1ファイル10MBまで）。" },
          { status: 400 }
        );
      }
      actualTotal += file.buffer.byteLength;
    }
    if (actualTotal > MAX_TOTAL_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "アップロードの合計サイズが大きすぎます（合計30MBまで）。ファイル数を減らしてお試しください。" },
        { status: 400 }
      );
    }

    for (const file of normalized) {
      if (file.mimeType !== ESTIMATE_ACCEPTED_PDF_TYPE) continue;
      try {
        const pageCount = await getPdfPageCount(file.buffer);
        if (pageCount > MAX_PDF_PAGES) {
          return NextResponse.json(
            { error: `PDFのページ数が多すぎます（1ファイルあたり最大${MAX_PDF_PAGES}ページまでです）。` },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "PDFファイルを読み込めませんでした。ファイルが破損していないかご確認ください。" },
          { status: 400 }
        );
      }
    }

    const ocrResult = await extractEstimateContent(normalized);

    if (ocrResult.isEstimate === false) {
      return NextResponse.json(
        { error: ocrResult.rejectionReason ?? "見積書として認識できませんでした。" },
        { status: 422 }
      );
    }

    const result = parseEstimateWithAI(ocrResult);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OcrNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 501 });
    }
    return NextResponse.json({ error: "見積書の解析中にエラーが発生しました。" }, { status: 500 });
  } finally {
    await deleteBlobsSafely(blobUrls);
  }
}
