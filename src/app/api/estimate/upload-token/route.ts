import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { ESTIMATE_ACCEPTED_MIME_TYPES, MAX_ESTIMATE_FILE_SIZE_BYTES } from "@/types/estimateFile";

export const runtime = "nodejs";

// 1ファイルにつき1回呼ばれるため、解析API本体より緩めの上限にする
const UPLOAD_TOKEN_RATE_LIMIT = { limit: 40, windowMs: 10 * 60 * 1000 }; // 10分間に40回まで

/**
 * Vercel Blobへのクライアント直接アップロード用トークン発行API
 *
 * ブラウザは BLOB_READ_WRITE_TOKEN を直接受け取らない。
 * このルートが handleUpload() を通じて、用途・形式・サイズが限定された
 * 使い捨てトークンだけを発行する（Vercel公式のクライアントアップロードの仕組み）。
 */
export async function POST(request: Request): Promise<NextResponse> {
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(`estimate-upload-token:${clientIp}`, UPLOAD_TOKEN_RATE_LIMIT);
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

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // 不正なContent-Type・過大なファイルサイズは、ここで指定した制約が
        // Vercel側インフラで強制されるため、クライアント側チェックのバイパスに対しても安全。
        return {
          allowedContentTypes: ESTIMATE_ACCEPTED_MIME_TYPES,
          maximumSizeInBytes: MAX_ESTIMATE_FILE_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // 解析は/api/estimate/analyzeへの明示的なリクエストで開始するため、
        // ここでは何もしない（Blob URL等はログに出力しない）。
      },
    });

    return NextResponse.json(jsonResponse);
  } catch {
    return NextResponse.json({ error: "アップロードの準備に失敗しました。" }, { status: 400 });
  }
}
