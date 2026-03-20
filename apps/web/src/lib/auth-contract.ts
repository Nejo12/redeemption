export interface AuthUserView {
  id: string;
  email: string;
  displayName: string | null;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "DISABLED";
  emailVerifiedAt: string | null;
}

export interface AuthSessionView {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
}

export interface TokenPreview {
  token: string;
  expiresAt: string;
}

export interface SignUpRequestBody {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignUpResponse {
  user: AuthUserView;
  nextStep: "verify_email";
  verification?: TokenPreview;
}

export interface VerifyEmailRequestBody {
  token: string;
}

export interface VerifyEmailResponse {
  user: AuthUserView;
  session: AuthSessionView;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUserView;
  session: AuthSessionView;
}

export interface PasswordResetRequestBody {
  email: string;
}

export interface PasswordResetRequestResponse {
  accepted: true;
  reset?: TokenPreview;
}

export interface PasswordResetConfirmRequestBody {
  token: string;
  newPassword: string;
}

export interface PasswordResetConfirmResponse {
  user: AuthUserView;
  session: AuthSessionView;
}

export interface MeResponse {
  user: AuthUserView;
}

export interface StoredAuthSession {
  user: AuthUserView;
  session: AuthSessionView;
}

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
  | "fullName"
  | "addressLine1"
  | "city"
  | "region"
  | "postalCode"
  | "countryCode"
  | "preferredLocale"
  | "preferredCurrency";

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
