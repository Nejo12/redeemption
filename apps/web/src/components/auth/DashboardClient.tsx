"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getCurrentUser, getSenderProfile } from "@/lib/auth-api";
import {
  clearStoredAuthSession,
  readStoredAuthSession,
  writeStoredAuthSession,
} from "@/lib/auth-session";
import { AuthUserView, SenderProfileReadinessView } from "@/lib/auth-contract";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { ActionLink } from "@/components/ui/ActionLink";
import { StatusPill } from "@/components/ui/StatusPill";

export function DashboardClient() {
  const [storedSession, setStoredSession] = useState(() => readStoredAuthSession());
  const [isRefreshing, startTransition] = useTransition();
  const [user, setUser] = useState<AuthUserView | null>(storedSession?.user ?? null);
  const [profileReadiness, setProfileReadiness] = useState<SenderProfileReadinessView | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    storedSession ? null : "No local auth session is stored yet.",
  );

  useEffect(() => {
    if (!storedSession) {
      return;
    }

    startTransition(async () => {
      try {
        const [meResponse, senderProfileResponse] = await Promise.all([
          getCurrentUser(storedSession.session.accessToken),
          getSenderProfile(storedSession.session.accessToken),
        ]);
        writeStoredAuthSession({
          user: meResponse.user,
          session: storedSession.session,
        });
        setUser(meResponse.user);
        setProfileReadiness(senderProfileResponse.readiness);
        setStatusMessage("Session is active and the API accepted the stored token.");
      } catch (error) {
        clearStoredAuthSession();
        setUser(null);
        setProfileReadiness(null);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to validate the current auth session.",
        );
      }
    });
  }, [startTransition, storedSession]);

  function handleSignOut() {
    clearStoredAuthSession();
    setStoredSession(null);
    setUser(null);
    setProfileReadiness(null);
    setStatusMessage(null);
    setErrorMessage("Local session cleared.");
  }

  return (
    <AuthFormCard
      title="Dashboard preview"
      description="This page proves the web app can store the auth session and call the protected `/auth/me` endpoint."
      footer={
        <div className="flex flex-wrap gap-3">
          <ActionLink href="/auth/login" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Sign in again
          </ActionLink>
          <ActionLink href="/docs" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            View system docs
          </ActionLink>
        </div>
      }
    >
      <div className="space-y-4">
        {statusMessage ? <AuthMessage tone="success">{statusMessage}</AuthMessage> : null}
        {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

        {user ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill>{user.status}</StatusPill>
              <span className="text-sm text-foreground/60">
                Verified at {user.emailVerifiedAt ?? "not available"}
              </span>
            </div>

            <div className="grid gap-3 rounded-[var(--radius-md)] border border-border bg-surface-strong px-5 py-5 text-sm leading-7 text-foreground/72">
              <p>
                <strong>Name:</strong> {user.displayName ?? "Not set yet"}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>User ID:</strong> {user.id}
              </p>
            </div>

            {profileReadiness ? (
              <AuthMessage tone={profileReadiness.isReadyForCheckout ? "success" : "info"}>
                {profileReadiness.isReadyForCheckout ? (
                  "Sender profile is complete. This account satisfies the current checkout readiness rule."
                ) : (
                  <>
                    Sender onboarding is still incomplete. Missing fields:{" "}
                    <strong>{profileReadiness.missingFields.join(", ")}</strong>
                  </>
                )}
              </AuthMessage>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-border-strong bg-surface-muted px-4 py-2 text-xs font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:bg-surface-strong"
                onClick={handleSignOut}
              >
                Sign out locally
              </button>
              <ActionLink
                href="/onboarding/sender-profile"
                variant="secondary"
                className="min-h-10 px-4 py-2 text-xs"
              >
                Edit sender profile
              </ActionLink>
              <ActionLink
                href="/contacts"
                variant="secondary"
                className="min-h-10 px-4 py-2 text-xs"
              >
                Manage contacts
              </ActionLink>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Test password reset flow
              </Link>
            </div>
          </div>
        ) : isRefreshing ? (
          <AuthMessage tone="info">Checking the stored session with the API.</AuthMessage>
        ) : null}
      </div>
    </AuthFormCard>
  );
}
