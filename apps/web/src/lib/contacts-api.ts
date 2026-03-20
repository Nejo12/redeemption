import { requestJson } from "@/lib/api-client";
import {
  ContactListResponse,
  ContactResponse,
  UpsertContactRequestBody,
} from "@/lib/contacts-contract";

export function listContacts(accessToken: string, search: string): Promise<ContactListResponse> {
  const searchParams = new URLSearchParams();
  if (search.trim()) {
    searchParams.set("q", search.trim());
  }

  const query = searchParams.toString();

  return requestJson<ContactListResponse>(`/contacts${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createContact(
  accessToken: string,
  payload: UpsertContactRequestBody,
): Promise<ContactResponse> {
  return requestJson<ContactResponse>("/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateContact(
  accessToken: string,
  contactId: string,
  payload: UpsertContactRequestBody,
): Promise<ContactResponse> {
  return requestJson<ContactResponse>(`/contacts/${contactId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteContact(accessToken: string, contactId: string): Promise<{ deleted: true }> {
  return requestJson<{ deleted: true }>(`/contacts/${contactId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
