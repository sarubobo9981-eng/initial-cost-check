import { NextRequest, NextResponse } from "next/server";
import { OcrNotConfiguredError } from "@/lib/ocr/ocrService";
import { normalizeEstimateFiles } from "@/lib/estimate/normalizeEstimateFiles";
import { extractEstimateContent } from "@/lib/estimate/extractEstimateContent";
import { parseEstimateWithAI } from "@/lib/estimate/parseEstimateWithAI";
import { getPdfPageCount } from "@/lib/estimate/pdfPageCount";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  ESTIMATE_ACCEPTED_MIME_TYPES,
  ESTIMATE_ACCEPTED_PDF_TYPE,
  MAX_ESTIMATE_FILES,
  MAX_ESTIMATE_FILE_SIZE_BYTES,
  MAX_PDF_PAGES,
  MAX_TOTAL_UPLOAD_BYTES,
} from "@/types/estimateFile";

export const runtime = "nodejs";

// 1つのIPから短時間に大量解析されないようにする簡易レート制限
const ANALYZE_RATE_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 }; // 10分間に8回まで

/**
 * 見積書解析API
 *
 * EstimateFile[]（カメラ撮影・写真選択・PDF選択のいずれの経路でも）を受け取り、
 * normalizeEstimateFiles → extractEstimateContent → parseEstimateWithAI という
 * 共通パイプラインで処理する。入力方式による分岐はこのファイルより下層で行わない。
 *
 * 注意: 見積書画像・PDF本文・Claudeのレスポンス全文・内部エラー詳細はログやレスポンスに出力しない
 * （個人情報を含む可能性があるため、また内部実装の詳細を利用者に見せないため）。
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

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "ファイルが見つかりません。" }, { status: 400 });
  }
  if (files.length > MAX_ESTIMATE_FILES) {
    return NextResponse.json(
      { error: `アップロードできるファイルは最大${MAX_ESTIMATE_FILES}枚までです。` },
      { status: 400 }
    );
  }

  let totalSize = 0;
  for (const file of files) {
    if (!ESTIMATE_ACCEPTED_MIME_TYPES.includes(file.type)) {
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
    totalSize += file.size;
  }

  if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "アップロードの合計サイズが大きすぎます（合計30MBまで）。ファイル数を減らしてお試しください。" },
      { status: 400 }
    );
  }

  const pdfFiles = files.filter((file) => file.type === ESTIMATE_ACCEPTED_PDF_TYPE);
  for (const pdfFile of pdfFiles) {
    try {
      const pageCount = await getPdfPageCount(Buffer.from(await pdfFile.arrayBuffer()));
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

  try {
    const normalized = await normalizeEstimateFiles(files);
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
  }
}
