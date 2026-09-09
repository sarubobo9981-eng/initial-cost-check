/**
 * 画像品質チェック（将来実装用のスタブ）
 *
 * 将来的に以下のような検出を追加しやすいよう、判定結果の型のみ先に定義しておく。
 * - ぼやけ検出 (blurry)
 * - 暗すぎる (too_dark)
 * - 見積書全体が写っていない (not_full_page)
 * - 文字が小さすぎる (text_too_small)
 *
 * 現時点では常に合格を返す（実際の画像解析は行わない）。
 */

export type ImageQualityIssue = "blurry" | "too_dark" | "not_full_page" | "text_too_small";

export interface ImageQualityCheckResult {
  passed: boolean;
  issues: ImageQualityIssue[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 将来の画像解析実装まではシグネチャのみ用意
export async function checkImageQuality(_file: File): Promise<ImageQualityCheckResult> {
  return { passed: true, issues: [] };
}
