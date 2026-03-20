import { ApiError, requestJson } from "@/lib/api-client";
import {
  LoginRequestBody,
  LoginResponse,
  MeResponse,
  PasswordResetConfirmRequestBody,
  PasswordResetConfirmResponse,
  PasswordResetRequestBody,
  PasswordResetRequestResponse,
  SignUpRequestBody,
  SignUpResponse,
  SenderProfileResponse,
  UpsertSenderProfileRequestBody,
  VerifyEmailRequestBody,
  VerifyEmailResponse,
} from "@/lib/auth-contract";

export function isAuthApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function signUp(payload: SignUpRequestBody): Promise<SignUpResponse> {
  return requestJson<SignUpResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyEmail(payload: VerifyEmailRequestBody): Promise<VerifyEmailResponse> {
  return requestJson<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginRequestBody): Promise<LoginResponse> {
  return requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(
  payload: PasswordResetRequestBody,
): Promise<PasswordResetRequestResponse> {
  return requestJson<PasswordResetRequestResponse>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmPasswordReset(
  payload: PasswordResetConfirmRequestBody,
): Promise<PasswordResetConfirmResponse> {
  return requestJson<PasswordResetConfirmResponse>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(accessToken: string): Promise<MeResponse> {
  return requestJson<MeResponse>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getSenderProfile(accessToken: string): Promise<SenderProfileResponse> {
  return requestJson<SenderProfileResponse>("/sender-profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function upsertSenderProfile(
  accessToken: string,
  payload: UpsertSenderProfileRequestBody,
): Promise<SenderProfileResponse> {
  return requestJson<SenderProfileResponse>("/sender-profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}
