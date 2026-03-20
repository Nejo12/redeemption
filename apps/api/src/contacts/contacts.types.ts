import {
  AddressValidationStatus,
  Contact,
  ContactAddressKind,
  RelationshipTag,
} from '@prisma/client';

export interface ContactAddressRecord {
  kind: ContactAddressKind;
  address: {
    id: string;
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string;
    countryCode: string;
    validationStatus: AddressValidationStatus;
  };
}

export type ContactRecord = Pick<
  Contact,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'relationshipTag'
  | 'birthday'
  | 'timezone'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
> & {
  addressLinks: ContactAddressRecord[];
};

export interface AddressOwnershipRecord {
  id: string;
}

export interface UpsertContactParams {
  userId: string;
  firstName: string;
  lastName: string;
  relationshipTag: RelationshipTag | null;
  birthday: Date | null;
  timezone: string | null;
  notes: string | null;
  primaryAddressId: string | null;
  alternateAddressIds: string[];
}

export interface DuplicateContactRecord {
  id: string;
}
