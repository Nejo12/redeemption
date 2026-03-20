export type RelationshipTagValue = 'FAMILY' | 'FRIEND' | 'PARTNER' | 'WORK';

export interface ContactView {
  id: string;
  firstName: string;
  lastName: string;
  relationshipTag: RelationshipTagValue | null;
  birthday: string | null;
  timezone: string | null;
  notes: string | null;
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
}
