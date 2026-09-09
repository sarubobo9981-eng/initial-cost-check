import { ContactFormPayload } from "@/types/contact";

/**
 * 通知サービス層（将来のメール通知・LINE通知接続を見据えた抽象化）
 *
 * MVP時点ではサーバーログへの出力のみ。
 * 実装する際は、この関数内で SendGrid / Resend / LINE Messaging API 等を呼び出す。
 * APIキーは必ずサーバー側の環境変数（process.env.*）から読み込むこと。
 */
export async function notifyNewContact(
  payload: ContactFormPayload,
  attachmentFileName?: string
): Promise<void> {
  // TODO: メール通知（例: Resend, SendGrid）をここに実装する
  // TODO: LINE通知（LINE Messaging API）をここに実装する
  // 氏名・連絡先・相談内容等の個人情報はログに出力しない
  console.log("[contact] 新しい問い合わせを受け付けました", {
    propertyName: payload.propertyName,
    hasAttachment: Boolean(attachmentFileName),
  });
}
