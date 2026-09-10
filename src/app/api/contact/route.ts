import { NextRequest, NextResponse } from "next/server";
import { ContactFormPayload, ReplyMethod } from "@/types/contact";
import { notifyNewContact } from "@/lib/notifications/notifyService";

export const runtime = "nodejs";

function isNonEmptyString(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toOptionalString(value: FormDataEntryValue | null): string | undefined {
  return isNonEmptyString(value) ? value : undefined;
}

function toReplyMethod(value: FormDataEntryValue | null): ReplyMethod {
  return value === "line" || value === "phone" ? value : "email";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const email = formData.get("email");
  const phone = formData.get("phone");
  const agreedToPrivacyPolicy = formData.get("agreedToPrivacyPolicy");
  const attachment = formData.get("attachment");

  const errors: string[] = [];
  // 返信先（メール・電話番号）のいずれか1つでも入力されていればよい
  // （LINEでのご相談はフォーム送信を伴わないため、ここには到達しない）
  if (!isNonEmptyString(email) && !isNonEmptyString(phone)) {
    errors.push("メールアドレスまたは電話番号を入力してください。");
  }
  if (agreedToPrivacyPolicy !== "true") errors.push("個人情報の取扱いへの同意が必要です。");

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const payload: ContactFormPayload = {
    name: toOptionalString(formData.get("name")),
    email: toOptionalString(email),
    phone: toOptionalString(phone),
    replyMethod: toReplyMethod(formData.get("replyMethod")),
    propertyName: toOptionalString(formData.get("propertyName")),
    propertyUrl: toOptionalString(formData.get("propertyUrl")),
    currentAgency: toOptionalString(formData.get("currentAgency")),
    desiredMoveInDate: toOptionalString(formData.get("desiredMoveInDate")),
    message: toOptionalString(formData.get("message")),
    agreedToPrivacyPolicy: true,
  };

  const attachmentData =
    attachment instanceof File && attachment.size > 0
      ? { fileName: attachment.name, buffer: Buffer.from(await attachment.arrayBuffer()) }
      : undefined;

  await notifyNewContact(payload, attachmentData);

  return NextResponse.json({ ok: true });
}
