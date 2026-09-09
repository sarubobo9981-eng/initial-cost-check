import { del } from "@vercel/blob";

/**
 * 解析対象のBlobを削除する（best-effort）。
 *
 * 成功・失敗どちらの解析結果でも、呼び出し元のtry/finallyから必ず呼ばれる想定。
 * 削除失敗時もURLやエラー詳細はログに出力しない（見積書ファイルの所在情報のため）。
 * 削除に失敗してもユーザーへのレスポンスは妨げない。
 *
 * TODO: ユーザーの途中離脱等で/api/estimate/analyzeが一度も呼ばれなかった場合、
 * アップロード済みのBlobがここでは削除されず孤立する可能性がある。
 * 将来的にVercel Cron等で「一定時間より古い一時Blobを定期的に削除する」
 * クリーンアップ処理を追加すること。
 */
export async function deleteBlobsSafely(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    await del(urls);
  } catch {
    console.error("[estimate] 一時ファイルの削除に失敗しました");
  }
}
