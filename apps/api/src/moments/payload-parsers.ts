import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CreateMomentRuleRequestBody,
  MomentApprovalModeValue,
  MomentDeliveryPreferenceValue,
  MomentEventTypeValue,
  RenderPhotoFitValue,
} from './moments.contract';

const eventTypes: ReadonlySet<MomentEventTypeValue> = new Set([
  'CONTACT_BIRTHDAY',
  'ONE_OFF_DATE',
]);
const deliveryPreferences: ReadonlySet<MomentDeliveryPreferenceValue> = new Set(
  ['ARRIVE_BY', 'SHIP_ON'],
);
const approvalModes: ReadonlySet<MomentApprovalModeValue> = new Set([
  'ALWAYS_ASK',
]);
const photoFits: ReadonlySet<RenderPhotoFitValue> = new Set(['FIT', 'COVER']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStringField(
  value: unknown,
  fieldName: string,
  allowEmpty = false,
): string {
  if (typeof value !== 'string') {
    throw new UnprocessableEntityException(`${fieldName} must be a string.`);
  }

  const trimmedValue = value.trim();
  if (!allowEmpty && !trimmedValue) {
    throw new UnprocessableEntityException(`${fieldName} is required.`);
  }

  return allowEmpty ? value : trimmedValue;
}

function parseNullableId(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return parseStringField(value, fieldName);
}

function parseEventType(value: unknown): MomentEventTypeValue {
  if (typeof value !== 'string' || !eventTypes.has(value as never)) {
    throw new UnprocessableEntityException(
      'eventType must be CONTACT_BIRTHDAY or ONE_OFF_DATE.',
    );
  }

  return value as MomentEventTypeValue;
}

function parseDeliveryPreference(
  value: unknown,
): MomentDeliveryPreferenceValue {
  if (typeof value !== 'string' || !deliveryPreferences.has(value as never)) {
    throw new UnprocessableEntityException(
      'deliveryPreference must be ARRIVE_BY or SHIP_ON.',
    );
  }

  return value as MomentDeliveryPreferenceValue;
}

function parseApprovalMode(value: unknown): MomentApprovalModeValue {
  if (typeof value !== 'string' || !approvalModes.has(value as never)) {
    throw new UnprocessableEntityException('approvalMode must be ALWAYS_ASK.');
  }

  return value as MomentApprovalModeValue;
}

function parsePhotoFit(value: unknown): RenderPhotoFitValue | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' || !photoFits.has(value as never)) {
    throw new UnprocessableEntityException('photoFit must be FIT or COVER.');
  }

  return value as RenderPhotoFitValue;
}

function parseLeadTimeDays(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new UnprocessableEntityException('leadTimeDays must be an integer.');
  }

  if (value < 0 || value > 60) {
    throw new UnprocessableEntityException(
      'leadTimeDays must be between 0 and 60.',
    );
  }

  return value;
}

function parseOneOffDate(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsedValue = parseStringField(value, 'oneOffDate');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedValue)) {
    throw new UnprocessableEntityException(
      'oneOffDate must use YYYY-MM-DD format.',
    );
  }

  return parsedValue;
}

export function parseCreateMomentRuleBody(
  body: unknown,
): CreateMomentRuleRequestBody {
  if (!isRecord(body)) {
    throw new BadRequestException('Moment payload must be an object.');
  }

  return {
    name: parseStringField(body.name, 'name'),
    contactId: parseStringField(body.contactId, 'contactId'),
    templateId: parseStringField(body.templateId, 'templateId'),
    eventType: parseEventType(body.eventType),
    oneOffDate: parseOneOffDate(body.oneOffDate),
    leadTimeDays: parseLeadTimeDays(body.leadTimeDays),
    deliveryPreference: parseDeliveryPreference(body.deliveryPreference),
    approvalMode: parseApprovalMode(body.approvalMode),
    messageTemplate: parseStringField(
      body.messageTemplate,
      'messageTemplate',
      true,
    ),
    photoObjectId: parseNullableId(body.photoObjectId, 'photoObjectId'),
    photoFit: parsePhotoFit(body.photoFit),
  };
}
