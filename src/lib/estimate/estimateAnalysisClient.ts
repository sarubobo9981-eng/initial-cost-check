import { upload } from "@vercel/blob/client";
import { EstimateFile, EstimateBlobFile } from "@/types/estimateFile";
import { EstimateAnalysisResult } from "@/types/estimateAnalysis";

/** ANTHROPIC_API_KEY未設定など、解析機能自体が利用できない場合 */
export class EstimateAnalysisNotConfiguredError extends Error {}
/** Claudeが「見積書として認識できない」と判定した場合 */
export class EstimateAnalysisRejectedError extends Error {}
/** 短時間に大量のリクエストがあった場合のレート制限 */
export class EstimateAnalysisRateLimitedError extends Error {}
/** その他の解析エラー（APIエラー・タイムアウト等） */
export class EstimateAnalysisError extends Error {}

function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "application/pdf") return "pdf";
  return "bin";
}

// 元のファイル名（個人情報を含みうる）は使わず、ランダムなパス名を生成する
function randomBlobPathname(mimeType: string): string {
  const random = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `estimates/${random}.${extensionForMimeType(mimeType)}`;
}

interface AnalyzeOptions {
  /** 全ファイルのBlobアップロードが完了した直後に呼ばれる（解析中UIの進捗表示用） */
  onUploaded?: () => void;
}

/**
 * 見積書解析APIの呼び出し（クライアント側）。
 * 撮影/写真選択/PDF選択のいずれで集めたファイルでも、まずVercel Blobへ直接アップロードし、
 * そのURL情報だけを/api/estimate/analyzeへ送信する
 * （Vercel Functionsのリクエストボディ上限(4.5MB)を回避するため。ファイル本体はサーバーを経由しない）。
 */
export async function analyzeEstimateFiles(
  files: EstimateFile[],
  options?: AnalyzeOptions
): Promise<EstimateAnalysisResult> {
  let uploaded: EstimateBlobFile[];
  try {
    uploaded = await Promise.all(
      files.map(async (estimateFile): Promise<EstimateBlobFile> => {
        const blob = await upload(randomBlobPathname(estimateFile.file.type), estimateFile.file, {
          access: "private",
          handleUploadUrl: "/api/estimate/upload-token",
        });
        return {
          url: blob.url,
          contentType: estimateFile.file.type,
          name: blob.pathname,
          size: estimateFile.file.size,
        };
      })
    );
  } catch {
    throw new EstimateAnalysisError("ファイルのアップロードに失敗しました。通信環境をご確認のうえ、もう一度お試しください。");
  }

  options?.onUploaded?.();

  const res = await fetch("/api/estimate/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: uploaded }),
  });

  if (res.status === 501) {
    const data = await res.json().catch(() => ({ error: undefined }));
    throw new EstimateAnalysisNotConfiguredError(
      data.error ?? "解析機能が設定されていません。手入力でご入力ください。"
    );
  }
  if (res.status === 422) {
    const data = await res.json().catch(() => ({ error: undefined }));
    throw new EstimateAnalysisRejectedError(data.error ?? "見積書として認識できませんでした。");
  }
  if (res.status === 429) {
    const data = await res.json().catch(() => ({ error: undefined }));
    throw new EstimateAnalysisRateLimitedError(
      data.error ?? "しばらく時間を空けてもう一度お試しください。"
    );
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: undefined }));
    throw new EstimateAnalysisError(data.error ?? "解析中にエラーが発生しました。");
  }

  return (await res.json()) as EstimateAnalysisResult;
}
