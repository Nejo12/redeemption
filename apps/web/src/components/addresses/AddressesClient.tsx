"use client";

import { useEffect, useState, useTransition } from "react";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "@/lib/addresses-api";
import {
  AddressResponse,
  AddressView,
  countryOptions,
  getCountryLabel,
} from "@/lib/addresses-contract";
import { readStoredAuthSession } from "@/lib/auth-session";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { ActionLink } from "@/components/ui/ActionLink";
import { PanelSurface } from "@/components/ui/PanelSurface";
import { StatusPill } from "@/components/ui/StatusPill";

const emptyForm = {
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  countryCode: "US",
};

export function AddressesClient() {
  const storedSession = readStoredAuthSession();
  const accessToken = storedSession?.session.accessToken ?? null;
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [addresses, setAddresses] = useState<AddressView[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formState, setFormState] = useState(emptyForm);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await listAddresses(accessToken, search);
        setAddresses(response.addresses);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load addresses.");
      }
    });
  }, [accessToken, search]);

  function handleInput(field: keyof typeof emptyForm, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function hydrateForm(address: AddressView) {
    setEditingAddressId(address.id);
    setFormState({
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      region: address.region ?? "",
      postalCode: address.postalCode,
      countryCode: address.countryCode,
    });
    setStatusMessage(null);
    setErrorMessage(null);
  }

  function resetForm() {
    setEditingAddressId(null);
    setFormState(emptyForm);
  }

  async function refreshAddresses() {
    if (!accessToken) {
      setAddresses([]);
      return;
    }

    const response = await listAddresses(accessToken, search);
    setAddresses(response.addresses);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!accessToken) {
      setErrorMessage("Sign in first before managing addresses.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          line1: formState.line1,
          line2: formState.line2 || undefined,
          city: formState.city,
          region: formState.region || undefined,
          postalCode: formState.postalCode,
          countryCode: formState.countryCode,
        };

        const response: AddressResponse = editingAddressId
          ? await updateAddress(accessToken, editingAddressId, payload)
          : await createAddress(accessToken, payload);

        await refreshAddresses();
        setStatusMessage(
          editingAddressId
            ? "Address updated successfully."
            : `Address saved as ${response.address.validationStatus.toLowerCase()}.`,
        );
        resetForm();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to save the address.");
      }
    });
  }

  function handleDelete(addressId: string) {
    if (!accessToken) {
      setErrorMessage("Sign in first before managing addresses.");
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await deleteAddress(accessToken, addressId);
        await refreshAddresses();
        if (editingAddressId === addressId) {
          resetForm();
        }
        setStatusMessage("Address deleted successfully.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to delete the address.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <AuthFormCard
        title={editingAddressId ? "Edit address" : "Add address"}
        description="This slice adds a dedicated address book with validation state before addresses are attached to contacts in the next step."
        footer={
          <div className="flex flex-wrap gap-3">
            <ActionLink
              href="/dashboard"
              variant="secondary"
              className="min-h-10 px-4 py-2 text-xs"
            >
              Back to dashboard
            </ActionLink>
            {editingAddressId ? (
              <button
                type="button"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                onClick={resetForm}
              >
                Clear editing state
              </button>
            ) : null}
          </div>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!storedSession ? (
            <AuthMessage tone="error">Sign in first before managing addresses.</AuthMessage>
          ) : null}

          <AuthField
            label="Address line 1"
            name="line1"
            value={formState.line1}
            onChange={(value) => handleInput("line1", value)}
          />

          <AuthField
            label="Address line 2"
            name="line2"
            value={formState.line2}
            onChange={(value) => handleInput("line2", value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="City"
              name="city"
              value={formState.city}
              onChange={(value) => handleInput("city", value)}
            />
            <AuthField
              label="Region / state"
              name="region"
              value={formState.region}
              onChange={(value) => handleInput("region", value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Postal code"
              name="postalCode"
              value={formState.postalCode}
              onChange={(value) => handleInput("postalCode", value)}
            />

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                Country
              </span>
              <select
                className="field-input"
                value={formState.countryCode}
                onChange={(event) => handleInput("countryCode", event.target.value)}
              >
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {statusMessage ? <AuthMessage tone="success">{statusMessage}</AuthMessage> : null}
          {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

          <AuthSubmitButton
            label={editingAddressId ? "Update address" : "Save address"}
            pendingLabel={editingAddressId ? "Updating address" : "Saving address"}
            isPending={isPending}
          />
        </form>
      </AuthFormCard>

      <PanelSurface className="px-6 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Address book
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Validated addresses for future contact assignments.
              </h2>
            </div>

            <label className="flex min-w-[220px] flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Search
              </span>
              <input
                className="field-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by city, postcode, or country"
              />
            </label>
          </div>

          <div className="grid gap-4">
            {addresses.length === 0 ? (
              <PanelSurface className="px-5 py-5 text-sm leading-7 text-foreground/65">
                No addresses found yet. Save one on the left to start the address book.
              </PanelSurface>
            ) : (
              addresses.map((address) => (
                <PanelSurface
                  key={address.id}
                  className="flex flex-col gap-4 px-5 py-5 text-sm leading-7 text-foreground/72"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                        {address.line1}
                      </h3>
                      <p className="text-sm text-foreground/55">
                        {address.line2 ? `${address.line2}, ` : ""}
                        {address.city}
                        {address.region ? `, ${address.region}` : ""} {address.postalCode}
                      </p>
                      <p className="text-sm text-foreground/55">
                        {getCountryLabel(address.countryCode)}
                      </p>
                    </div>

                    <StatusPill tone={address.validationStatus === "VALID" ? "success" : "accent"}>
                      {address.validationStatus}
                    </StatusPill>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-border-strong bg-surface-muted px-4 py-2 text-xs font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:bg-surface-strong"
                      onClick={() => hydrateForm(address)}
                    >
                      Edit address
                    </button>
                    <button
                      type="button"
                      className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                      onClick={() => handleDelete(address.id)}
                    >
                      Delete address
                    </button>
                  </div>
                </PanelSurface>
              ))
            )}
          </div>
        </div>
      </PanelSurface>
    </div>
  );
}
