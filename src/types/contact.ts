export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  lineId?: string;
  propertyName: string;
  propertyUrl?: string;
  currentAgency?: string;
  desiredMoveInDate?: string;
  message: string;
  agreedToPrivacyPolicy: boolean;
}
