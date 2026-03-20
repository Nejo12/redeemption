"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getSenderProfile, upsertSenderProfile } from "@/lib/auth-api";
import { readStoredAuthSession } from "@/lib/auth-session";
import { SenderProfileResponse } from "@/lib/auth-contract";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { ActionLink } from "@/components/ui/ActionLink";

const defaultFields = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  countryCode: "US",
  preferredLocale: "en-US",
  preferredCurrency: "USD",
};

export function SenderProfileForm() {
  const [isPending, startTransition] = useTransition();
  const [isHydrating, setIsHydrating] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileState, setProfileState] = useState(defaultFields);
  const [readiness, setReadiness] = useState<SenderProfileResponse["readiness"] | null>(null);

  useEffect(() => {
    const storedSession = readStoredAuthSession();
    if (!storedSession) {
      setErrorMessage("Sign in first before editing the sender profile.");
      setIsHydrating(false);
      return;
    }

    startTransition(async () => {
      try {
        const response = await getSenderProfile(storedSession.session.accessToken);
        setProfileState({
          fullName: response.profile.fullName ?? "",
          addressLine1: response.profile.addressLine1 ?? "",
          addressLine2: response.profile.addressLine2 ?? "",
          city: response.profile.city ?? "",
          region: response.profile.region ?? "",
          postalCode: response.profile.postalCode ?? "",
          countryCode: response.profile.countryCode ?? "US",
          preferredLocale: response.profile.preferredLocale ?? "en-US",
          preferredCurrency: response.profile.preferredCurrency ?? "USD",
        });
        setReadiness(response.readiness);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load the sender profile.",
        );
      } finally {
        setIsHydrating(false);
      }
    });
  }, []);

  function updateField(field: keyof typeof defaultFields, value: string) {
    setProfileState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const storedSession = readStoredAuthSession();
    if (!storedSession) {
      setErrorMessage("Sign in first before editing the sender profile.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await upsertSenderProfile(storedSession.session.accessToken, profileState);
        setReadiness(response.readiness);
        setStatusMessage(
          response.readiness.isReadyForCheckout
            ? "Sender profile saved. This account is now ready for checkout gating."
            : "Sender profile saved, but some required readiness fields are still missing.",
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to save the sender profile.",
        );
      }
    });
  }

  return (
    <AuthFormCard
      title="Sender profile"
      description="Save the return-address and preference fields that define readiness for checkout."
      footer={
        <div className="flex flex-wrap gap-3">
          <ActionLink href="/dashboard" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Back to dashboard
          </ActionLink>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Re-authenticate
          </Link>
        </div>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="Sender name"
            name="fullName"
            value={profileState.fullName}
            onChange={(value) => updateField("fullName", value)}
          />
          <AuthField
            label="Country code"
            name="countryCode"
            value={profileState.countryCode}
            onChange={(value) => updateField("countryCode", value.toUpperCase())}
          />
        </div>

        <AuthField
          label="Address line 1"
          name="addressLine1"
          value={profileState.addressLine1}
          onChange={(value) => updateField("addressLine1", value)}
        />
        <AuthField
          label="Address line 2"
          name="addressLine2"
          value={profileState.addressLine2}
          onChange={(value) => updateField("addressLine2", value)}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <AuthField
            label="City"
            name="city"
            value={profileState.city}
            onChange={(value) => updateField("city", value)}
          />
          <AuthField
            label="Region"
            name="region"
            value={profileState.region}
            onChange={(value) => updateField("region", value)}
          />
          <AuthField
            label="Postal code"
            name="postalCode"
            value={profileState.postalCode}
            onChange={(value) => updateField("postalCode", value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="Preferred locale"
            name="preferredLocale"
            value={profileState.preferredLocale}
            onChange={(value) => updateField("preferredLocale", value)}
          />
          <AuthField
            label="Preferred currency"
            name="preferredCurrency"
            value={profileState.preferredCurrency}
            onChange={(value) => updateField("preferredCurrency", value.toUpperCase())}
          />
        </div>

        {isHydrating ? (
          <AuthMessage tone="info">Loading the current sender profile.</AuthMessage>
        ) : null}

        {readiness ? (
          <AuthMessage tone={readiness.isReadyForCheckout ? "success" : "info"}>
            {readiness.isReadyForCheckout ? (
              "This account currently satisfies the sender-profile readiness gate."
            ) : (
              <>
                Missing readiness fields: <strong>{readiness.missingFields.join(", ")}</strong>
              </>
            )}
          </AuthMessage>
        ) : null}

        {statusMessage ? <AuthMessage tone="success">{statusMessage}</AuthMessage> : null}
        {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

        <AuthSubmitButton
          label="Save sender profile"
          pendingLabel="Saving sender profile"
          isPending={isPending}
        />
      </form>
    </AuthFormCard>
  );
}
