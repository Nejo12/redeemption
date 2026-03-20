import { Contact, RelationshipTag } from '@prisma/client';

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
>;

export interface UpsertContactParams {
  userId: string;
  firstName: string;
  lastName: string;
  relationshipTag: RelationshipTag | null;
  birthday: Date | null;
  timezone: string | null;
  notes: string | null;
}

export interface DuplicateContactRecord {
  id: string;
}
