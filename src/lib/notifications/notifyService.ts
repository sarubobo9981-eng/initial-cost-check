import { ContactFormPayload, ReplyMethod } from "@/types/contact";
import { sendEmail } from "@/lib/notifications/emailService";
import { CONTACT_NOTIFICATION_EMAIL, SITE_NAME } from "@config/company";

export interface ContactAttachment {
  fileName: string;
  buffer: Buffer;
}

const REPLY_METHOD_LABEL: Record<ReplyMethod, string> = {
  email: "メールアドレス",
  line: "LINE",
  phone: "電話番号",
};

/**
 * 通知サービス層。
 * 問い合わせ内容をメールで通知する（Resend経由）。
 * 実装する際は、この関数内で LINE Messaging API 等の追加通知も呼び出せる。
 */
export async function notifyNewContact(
  payload: ContactFormPayload,
  attachment?: ContactAttachment
): Promise<void> {
  // 氏名・連絡先・相談内容等の個人情報はログに出力しない
  console.log("[contact] 新しい問い合わせを受け付けました", {
    propertyName: payload.propertyName || "（未入力）",
    hasAttachment: Boolean(attachment),
  });

  try {
    await sendEmail({
      to: CONTACT_NOTIFICATION_EMAIL,
      subject: `【${SITE_NAME}】新しいお問い合わせ${
        payload.propertyName ? `：${payload.propertyName}` : ""
      }`,
      text: buildEmailBody(payload, attachment?.fileName),
      attachments: attachment ? [{ filename: attachment.fileName, content: attachment.buffer }] : undefined,
    });
  } catch {
    // メール送信に失敗しても、問い合わせ自体は受け付け済みとしてユーザー体験をブロックしない。
    // メールアドレス等の詳細はログに出力しない。
    console.error("[contact] メール通知の送信に失敗しました");
  }
}

function buildEmailBody(payload: ContactFormPayload, attachmentFileName?: string): string {
  const lines = [
    `希望の返信先: ${REPLY_METHOD_LABEL[payload.replyMethod]}`,
    `お名前: ${payload.name || "（未入力）"}`,
    `メールアドレス: ${payload.email || "（未入力）"}`,
    `電話番号: ${payload.phone || "（未入力）"}`,
    `物件名: ${payload.propertyName || "（未入力）"}`,
    `物件URL: ${payload.propertyUrl || "（未入力）"}`,
    `現在の不動産会社: ${payload.currentAgency || "（未入力）"}`,
    `希望入居日: ${payload.desiredMoveInDate || "（未入力）"}`,
    "",
    "気になること:",
    payload.message || "（未入力）",
  ];

  if (attachmentFileName) {
    lines.push("", `添付ファイル: ${attachmentFileName}（本メールに添付しています）`);
  }

  return lines.join("\n");
}
