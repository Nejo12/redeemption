export type AddressValidationStatusValue = 'VALID' | 'INVALID';

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
