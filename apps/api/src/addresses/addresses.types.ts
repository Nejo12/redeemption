import { Address, AddressValidationStatus } from '@prisma/client';

export type AddressRecord = Pick<
  Address,
  | 'id'
  | 'line1'
  | 'line2'
  | 'city'
  | 'region'
  | 'postalCode'
  | 'countryCode'
  | 'validationStatus'
  | 'createdAt'
  | 'updatedAt'
>;

export interface UpsertAddressParams {
  userId: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  countryCode: string;
  validationStatus: AddressValidationStatus;
}
