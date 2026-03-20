export type AddressValidationStatusValue = "VALID" | "INVALID";

export interface AddressView {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  countryCode: string;
  validationStatus: AddressValidationStatusValue;
  createdAt: string;
  updatedAt: string;
}

export interface AddressResponse {
  address: AddressView;
}

export interface AddressListResponse {
  addresses: AddressView[];
}

export interface UpsertAddressRequestBody {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  countryCode: string;
}

export const countryOptions = [
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "GB", label: "United Kingdom" },
  { value: "IE", label: "Ireland" },
  { value: "NG", label: "Nigeria" },
  { value: "NL", label: "Netherlands" },
  { value: "US", label: "United States" },
] as const;

export function getCountryLabel(countryCode: string): string {
  return countryOptions.find((option) => option.value === countryCode)?.label ?? countryCode;
}
