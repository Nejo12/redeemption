export interface SenderProfileView {
  fullName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  preferredLocale: string | null;
  preferredCurrency: string | null;
}

export type SenderProfileReadinessField =
  | 'fullName'
  | 'addressLine1'
  | 'city'
  | 'region'
  | 'postalCode'
  | 'countryCode'
  | 'preferredLocale'
  | 'preferredCurrency';

export interface SenderProfileReadinessView {
  isReadyForCheckout: boolean;
  missingFields: SenderProfileReadinessField[];
}

export interface SenderProfileResponse {
  profile: SenderProfileView;
  readiness: SenderProfileReadinessView;
}

export interface UpsertSenderProfileRequestBody {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  preferredLocale: string;
  preferredCurrency: string;
}
