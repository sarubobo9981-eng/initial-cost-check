import { Resend } from "resend";

/**
 * メール送信サービス層（Resendを使用）
 *
 * RESEND_API_KEYはサーバー側の環境変数からのみ読み込む（フロントエンドには一切公開しない）。
 * 未設定の場合は送信をスキップし、EmailNotConfiguredErrorを投げる
 * （呼び出し元でcatchし、ユーザー体験をブロックしない設計とすること）。
 *
 * 各段階でVercel Runtime Logsから原因を追えるようログを出す。
 * ただし、問い合わせ内容やメールアドレス等の個人情報、APIキーの値そのものは出力しない。
 */

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("メール通知が設定されていません。");
    this.name = "EmailNotConfiguredError";
  }
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  attachments?: EmailAttachment[];
}

// ドメイン未検証の状態でも送信できるResendの既定送信元（Resendアカウント所有者本人にのみ配信可能）
const DEFAULT_FROM = "onboarding@resend.dev";

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  console.log(`[contact] RESEND_API_KEY configured: ${Boolean(apiKey)}`);

  if (!apiKey) {
    throw new EmailNotConfiguredError();
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  console.log("[contact] Resend送信開始");

  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    attachments: params.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
    })),
  });

  if (error) {
    console.error("[contact] メール送信失敗", {
      statusCode: error.statusCode,
      name: error.name,
      message: error.message,
    });
    throw new Error("メールの送信に失敗しました。");
  }

  console.log("[contact] メール送信成功", { id: data?.id });
}
