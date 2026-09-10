export type ReplyMethod = "email" | "line" | "phone";

export interface ContactFormPayload {
  name?: string;
  email?: string;
  phone?: string;
  replyMethod: ReplyMethod;
  propertyName?: string;
  propertyUrl?: string;
  currentAgency?: string;
  desiredMoveInDate?: string;
  message?: string;
  agreedToPrivacyPolicy: boolean;
}
