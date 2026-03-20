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

class AuthApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message.join(" ");
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }
  } catch {
    return `Request failed with status ${response.status}.`;
  }

  return `Request failed with status ${response.status}.`;
}

async function requestJson<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new AuthApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

export function isAuthApiError(error: unknown): error is AuthApiError {
  return error instanceof AuthApiError;
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
