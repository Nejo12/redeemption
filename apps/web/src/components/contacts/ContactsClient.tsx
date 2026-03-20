"use client";

import { useEffect, useState, useTransition } from "react";
import { listAddresses } from "@/lib/addresses-api";
import { AddressView, getCountryLabel } from "@/lib/addresses-contract";
import { createContact, deleteContact, listContacts, updateContact } from "@/lib/contacts-api";
import {
  ContactResponse,
  ContactView,
  relationshipTagOptions,
  RelationshipTagValue,
} from "@/lib/contacts-contract";
import { readStoredAuthSession } from "@/lib/auth-session";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { ActionLink } from "@/components/ui/ActionLink";
import { PanelSurface } from "@/components/ui/PanelSurface";

const emptyForm = {
  firstName: "",
  lastName: "",
  relationshipTag: "",
  birthday: "",
  timezone: "",
  notes: "",
  primaryAddressId: "",
  alternateAddressIds: [] as string[],
};

export function ContactsClient() {
  const storedSession = readStoredAuthSession();
  const accessToken = storedSession?.session.accessToken ?? null;
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<ContactView[]>([]);
  const [addressOptions, setAddressOptions] = useState<AddressView[]>([]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [formState, setFormState] = useState(emptyForm);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    startTransition(async () => {
      try {
        const [contactsResponse, addressesResponse] = await Promise.all([
          listContacts(accessToken, search),
          listAddresses(accessToken, ""),
        ]);
        setContacts(contactsResponse.contacts);
        setAddressOptions(addressesResponse.addresses);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load contacts.");
      }
    });
  }, [accessToken, search]);

  function handleInput(field: keyof typeof emptyForm, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function hydrateForm(contact: ContactView) {
    setEditingContactId(contact.id);
    setFormState({
      firstName: contact.firstName,
      lastName: contact.lastName,
      relationshipTag: contact.relationshipTag ?? "",
      birthday: contact.birthday ?? "",
      timezone: contact.timezone ?? "",
      notes: contact.notes ?? "",
      primaryAddressId: contact.primaryAddress?.id ?? "",
      alternateAddressIds: contact.alternateAddresses.map((address) => address.id),
    });
    setStatusMessage(null);
    setErrorMessage(null);
    setDuplicateMessage(null);
  }

  function resetForm() {
    setEditingContactId(null);
    setFormState(emptyForm);
  }

  async function refreshContacts() {
    if (!accessToken) {
      setContacts([]);
      return;
    }

    const response = await listContacts(accessToken, search);
    setContacts(response.contacts);
  }

  function handleAlternateToggle(addressId: string) {
    setFormState((current) => {
      const isSelected = current.alternateAddressIds.includes(addressId);

      return {
        ...current,
        alternateAddressIds: isSelected
          ? current.alternateAddressIds.filter((id) => id !== addressId)
          : [...current.alternateAddressIds, addressId],
      };
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setDuplicateMessage(null);

    if (!accessToken) {
      setErrorMessage("Sign in first before managing contacts.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          firstName: formState.firstName,
          lastName: formState.lastName,
          relationshipTag: (formState.relationshipTag as RelationshipTagValue | "") || undefined,
          birthday: formState.birthday || undefined,
          timezone: formState.timezone || undefined,
          notes: formState.notes || undefined,
          primaryAddressId: formState.primaryAddressId || undefined,
          alternateAddressIds: formState.alternateAddressIds,
        };

        const response: ContactResponse = editingContactId
          ? await updateContact(accessToken, editingContactId, payload)
          : await createContact(accessToken, payload);

        await refreshContacts();
        setStatusMessage(
          editingContactId ? "Contact updated successfully." : "Contact created successfully.",
        );
        setDuplicateMessage(response.warning?.message ?? null);
        resetForm();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to save the contact.");
      }
    });
  }

  function handleDelete(contactId: string) {
    if (!accessToken) {
      setErrorMessage("Sign in first before managing contacts.");
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);
    setDuplicateMessage(null);

    startTransition(async () => {
      try {
        await deleteContact(accessToken, contactId);
        await refreshContacts();
        if (editingContactId === contactId) {
          resetForm();
        }
        setStatusMessage("Contact deleted successfully.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to delete the contact.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <AuthFormCard
        title={editingContactId ? "Edit contact" : "Add contact"}
        description="This is the first protected business route after auth. It exercises typed API CRUD rather than static placeholders."
        footer={
          <div className="flex flex-wrap gap-3">
            <ActionLink
              href="/dashboard"
              variant="secondary"
              className="min-h-10 px-4 py-2 text-xs"
            >
              Back to dashboard
            </ActionLink>
            {editingContactId ? (
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
            <AuthMessage tone="error">Sign in first before managing contacts.</AuthMessage>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="First name"
              name="firstName"
              value={formState.firstName}
              onChange={(value) => handleInput("firstName", value)}
            />
            <AuthField
              label="Last name"
              name="lastName"
              value={formState.lastName}
              onChange={(value) => handleInput("lastName", value)}
            />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              Relationship tag
            </span>
            <select
              className="field-input"
              value={formState.relationshipTag}
              onChange={(event) => handleInput("relationshipTag", event.target.value)}
            >
              <option value="">Select relationship</option>
              {relationshipTagOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Birthday"
              name="birthday"
              type="text"
              value={formState.birthday}
              placeholder="YYYY-MM-DD"
              onChange={(value) => handleInput("birthday", value)}
            />
            <AuthField
              label="Timezone"
              name="timezone"
              value={formState.timezone}
              placeholder="Europe/Berlin"
              onChange={(value) => handleInput("timezone", value)}
            />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              Notes
            </span>
            <textarea
              className="field-input min-h-28 resize-y"
              value={formState.notes}
              onChange={(event) => handleInput("notes", event.target.value)}
            />
          </label>

          {addressOptions.length > 0 ? (
            <>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                  Primary address
                </span>
                <select
                  className="field-input"
                  value={formState.primaryAddressId}
                  onChange={(event) => handleInput("primaryAddressId", event.target.value)}
                >
                  <option value="">No primary address selected</option>
                  {addressOptions.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.line1}, {address.city}, {getCountryLabel(address.countryCode)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                  Alternate addresses
                </span>
                <div className="grid gap-2">
                  {addressOptions.map((address) => {
                    const isPrimary = formState.primaryAddressId === address.id;

                    return (
                      <label
                        key={address.id}
                        className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-foreground/72"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={formState.alternateAddressIds.includes(address.id)}
                          disabled={isPrimary}
                          onChange={() => handleAlternateToggle(address.id)}
                        />
                        <span>
                          {address.line1}, {address.city}
                          {address.region ? `, ${address.region}` : ""} {address.postalCode},{" "}
                          {getCountryLabel(address.countryCode)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <AuthMessage tone="info">
              No saved addresses are available yet. Create addresses first to assign them to
              contacts.
            </AuthMessage>
          )}

          {statusMessage ? <AuthMessage tone="success">{statusMessage}</AuthMessage> : null}
          {duplicateMessage ? <AuthMessage tone="info">{duplicateMessage}</AuthMessage> : null}
          {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

          <AuthSubmitButton
            label={editingContactId ? "Update contact" : "Create contact"}
            pendingLabel={editingContactId ? "Updating contact" : "Creating contact"}
            isPending={isPending}
          />
        </form>
      </AuthFormCard>

      <PanelSurface className="px-6 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Contacts
              </h2>
              <p className="text-sm leading-7 text-foreground/70">
                Search and review the first protected domain entities in the product.
              </p>
            </div>
            <label className="flex w-full max-w-sm flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                Search
              </span>
              <input
                className="field-input"
                value={search}
                placeholder="Find by name or notes"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-3">
            {contacts.length === 0 ? (
              <AuthMessage tone="info">
                No contacts exist yet for this account. Create one from the form.
              </AuthMessage>
            ) : (
              contacts.map((contact) => (
                <PanelSurface
                  key={contact.id}
                  className="rounded-[var(--radius-md)] bg-surface-strong px-5 py-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-foreground">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-sm leading-7 text-foreground/70">
                        {contact.relationshipTag ? `${contact.relationshipTag} · ` : ""}
                        {contact.birthday ? `Birthday ${contact.birthday}` : "No birthday set"}
                      </p>
                      {contact.timezone ? (
                        <p className="text-sm text-foreground/60">Timezone: {contact.timezone}</p>
                      ) : null}
                      {contact.notes ? (
                        <p className="text-sm leading-7 text-foreground/70">{contact.notes}</p>
                      ) : null}
                      {contact.primaryAddress ? (
                        <p className="text-sm leading-7 text-foreground/70">
                          Primary address: {contact.primaryAddress.line1},{" "}
                          {contact.primaryAddress.city},{" "}
                          {getCountryLabel(contact.primaryAddress.countryCode)}
                        </p>
                      ) : null}
                      {contact.alternateAddresses.length > 0 ? (
                        <p className="text-sm leading-7 text-foreground/70">
                          Alternate addresses:{" "}
                          {contact.alternateAddresses
                            .map(
                              (address) =>
                                `${address.line1}, ${address.city}, ${getCountryLabel(address.countryCode)}`,
                            )
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                        onClick={() => hydrateForm(contact)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-foreground/60 underline-offset-4 hover:text-accent hover:underline"
                        onClick={() => handleDelete(contact.id)}
                      >
                        Delete
                      </button>
                    </div>
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
