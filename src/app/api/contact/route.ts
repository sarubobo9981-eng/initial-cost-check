import { NextRequest, NextResponse } from "next/server";
import { ContactFormPayload } from "@/types/contact";
import { notifyNewContact } from "@/lib/notifications/notifyService";

export const runtime = "nodejs";

function isNonEmptyString(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const name = formData.get("name");
  const email = formData.get("email");
  const propertyName = formData.get("propertyName");
  const message = formData.get("message");
  const agreedToPrivacyPolicy = formData.get("agreedToPrivacyPolicy");
  const attachment = formData.get("attachment");

  const errors: string[] = [];
  if (!isNonEmptyString(name)) errors.push("お名前を入力してください。");
  if (!isNonEmptyString(email)) errors.push("メールアドレスを入力してください。");
  if (!isNonEmptyString(propertyName)) errors.push("物件名を入力してください。");
  if (!isNonEmptyString(message)) errors.push("相談内容を入力してください。");
  if (agreedToPrivacyPolicy !== "true") errors.push("個人情報の取扱いへの同意が必要です。");

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const payload: ContactFormPayload = {
    name: name as string,
    email: email as string,
    phone: isNonEmptyString(formData.get("phone")) ? (formData.get("phone") as string) : undefined,
    lineId: isNonEmptyString(formData.get("lineId")) ? (formData.get("lineId") as string) : undefined,
    propertyName: propertyName as string,
    propertyUrl: isNonEmptyString(formData.get("propertyUrl"))
      ? (formData.get("propertyUrl") as string)
      : undefined,
    currentAgency: isNonEmptyString(formData.get("currentAgency"))
      ? (formData.get("currentAgency") as string)
      : undefined,
    desiredMoveInDate: isNonEmptyString(formData.get("desiredMoveInDate"))
      ? (formData.get("desiredMoveInDate") as string)
      : undefined,
    message: message as string,
    agreedToPrivacyPolicy: true,
  };

  const attachmentFileName = attachment instanceof File ? attachment.name : undefined;

  await notifyNewContact(payload, attachmentFileName);

  return NextResponse.json({ ok: true });
}
