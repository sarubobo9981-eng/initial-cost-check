import { EstimateFile } from "@/types/estimateFile";
import { EstimateAnalysisResult } from "@/types/estimateAnalysis";

/** ANTHROPIC_API_KEY未設定など、解析機能自体が利用できない場合 */
export class EstimateAnalysisNotConfiguredError extends Error {}
/** Claudeが「見積書として認識できない」と判定した場合 */
export class EstimateAnalysisRejectedError extends Error {}
/** 短時間に大量のリクエストがあった場合のレート制限 */
export class EstimateAnalysisRateLimitedError extends Error {}
/** その他の解析エラー（APIエラー・タイムアウト等） */
export class EstimateAnalysisError extends Error {}

/**
 * 見積書解析APIの呼び出し（クライアント側）。
 * 撮影/写真選択/PDF選択のいずれで集めたファイルでも、同じエンドポイントに送信する。
 */
export async function analyzeEstimateFiles(files: EstimateFile[]): Promise<EstimateAnalysisResult> {
  const body = new FormData();
  files.forEach((estimateFile) => body.append("files", estimateFile.file));

  const res = await fetch("/api/estimate/analyze", { method: "POST", body });

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
