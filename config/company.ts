/**
 * 会社情報・サービス設定
 *
 * 本番公開前に、実際の値へ必ず置き換えてください。
 * 「【要入力】」のプレースホルダーのまま公開しないこと。
 */

// サービス名・サイト情報（本サービス自体の名称。後から自由に変更可）
export const SITE_NAME = "初期費用チェック";
export const SITE_DESCRIPTION =
  "賃貸契約の初期費用見積もりを入力するだけで、内訳を整理し、見直せる可能性のある費用を確認できる無料サービスです。";
// TODO: 本番公開時に実際のドメインへ置き換えてください
export const SITE_URL = "https://example.com";

// 運営会社情報（本番公開前に必ず実際の情報へ置き換えてください）
export const COMPANY_NAME = "【運営会社名を入力】";
export const ADDRESS = "【所在地を入力】";
export const PHONE = "【電話番号を入力】";
export const LICENSE_NUMBER = "【宅地建物取引業免許番号を入力】";
export const INDUSTRY_ASSOCIATION = "【所属団体名を入力】";
export const CONTACT_EMAIL = "【問い合わせ用メールアドレスを入力】";

// LINE公式アカウント（後から簡単に変更できるよう定数化）
export const LINE_URL = "https://lin.ee/oA0hKFy";

// 問い合わせフォームの送信先（未設定の場合はAPI Route内でログ出力のみ）
export const CONTACT_NOTIFICATION_EMAIL = CONTACT_EMAIL;
