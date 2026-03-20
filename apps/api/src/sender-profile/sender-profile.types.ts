import { SenderProfile } from '@prisma/client';
import {
  SenderProfileReadinessField,
  SenderProfileView,
} from './sender-profile.contract';

export type SenderProfileRecord = Pick<
  SenderProfile,
  | 'fullName'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'region'
  | 'postalCode'
  | 'countryCode'
  | 'preferredLocale'
  | 'preferredCurrency'
>;

export interface UpsertSenderProfileParams extends SenderProfileView {
  userId: string;
}

export const senderProfileRequiredFields: SenderProfileReadinessField[] = [
  'fullName',
  'addressLine1',
  'city',
  'region',
  'postalCode',
  'countryCode',
  'preferredLocale',
  'preferredCurrency',
];
