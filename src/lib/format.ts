/** 金額表示用フォーマッタ（3桁カンマ区切り + ¥記号） */
export function formatYen(amount: number): string {
  const rounded = Math.round(amount);
  return `¥${rounded.toLocaleString("ja-JP")}`;
}

/** カンマ区切りのみ（¥記号なし） */
export function formatNumber(amount: number): string {
  return Math.round(amount).toLocaleString("ja-JP");
}

/** 入力文字列（全角数字・カンマ混在可）を数値に変換。不正な値は0を返す */
export function parseYenInput(value: string): number {
  const normalized = value
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");
  if (normalized === "") return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
