import { requestJson } from "@/lib/api-client";
import {
  AddressListResponse,
  AddressResponse,
  UpsertAddressRequestBody,
} from "@/lib/addresses-contract";

export function listAddresses(accessToken: string, search: string): Promise<AddressListResponse> {
  const searchParams = new URLSearchParams();
  if (search.trim()) {
    searchParams.set("q", search.trim());
  }

  const query = searchParams.toString();

  return requestJson<AddressListResponse>(`/addresses${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createAddress(
  accessToken: string,
  payload: UpsertAddressRequestBody,
): Promise<AddressResponse> {
  return requestJson<AddressResponse>("/addresses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateAddress(
  accessToken: string,
  addressId: string,
  payload: UpsertAddressRequestBody,
): Promise<AddressResponse> {
  return requestJson<AddressResponse>(`/addresses/${addressId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteAddress(accessToken: string, addressId: string): Promise<{ deleted: true }> {
  return requestJson<{ deleted: true }>(`/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
