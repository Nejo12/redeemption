import { AddressValidationStatus, OrderStatus } from '@prisma/client';
import { SenderProfileRecord } from '../sender-profile/sender-profile.types';

export interface PricingOrderRecord {
  id: string;
  userId: string;
  contactId: string;
  templateId: string;
  status: OrderStatus;
}

export interface PricingTemplateRecord {
  id: string;
  widthMm: number;
  heightMm: number;
}

export interface PricingPrimaryAddressRecord {
  countryCode: string;
  validationStatus: AddressValidationStatus;
}

export type PricingSenderProfileRecord = SenderProfileRecord;
