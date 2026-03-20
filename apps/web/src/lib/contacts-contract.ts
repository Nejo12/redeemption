export type RelationshipTagValue = "FAMILY" | "FRIEND" | "PARTNER" | "WORK";
export type AddressValidationStatusValue = "VALID" | "INVALID";

export interface ContactAddressView {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  countryCode: string;
  validationStatus: AddressValidationStatusValue;
}

export interface ContactView {
  id: string;
  firstName: string;
  lastName: string;
  relationshipTag: RelationshipTagValue | null;
  birthday: string | null;
  timezone: string | null;
  notes: string | null;
  primaryAddress: ContactAddressView | null;
  alternateAddresses: ContactAddressView[];
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateContactWarning {
  duplicateContactIds: string[];
  message: string;
}

export interface ContactResponse {
  contact: ContactView;
  warning?: DuplicateContactWarning;
}

export interface ContactListResponse {
  contacts: ContactView[];
}

export interface UpsertContactRequestBody {
  firstName: string;
  lastName: string;
  relationshipTag?: RelationshipTagValue;
  birthday?: string;
  timezone?: string;
  notes?: string;
  primaryAddressId?: string;
  alternateAddressIds?: string[];
}

export const relationshipTagOptions: Array<{
  label: string;
  value: RelationshipTagValue;
}> = [
  { label: "Family", value: "FAMILY" },
  { label: "Friend", value: "FRIEND" },
  { label: "Partner", value: "PARTNER" },
  { label: "Work", value: "WORK" },
];
