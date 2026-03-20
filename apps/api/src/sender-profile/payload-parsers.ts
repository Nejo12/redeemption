import { BadRequestException } from '@nestjs/common';
import { UpsertSenderProfileRequestBody } from './sender-profile.contract';

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Request body must be an object.');
  }

  return value as Record<string, unknown>;
}

function readString(
  input: Record<string, unknown>,
  fieldName: string,
  required = true,
): string {
  const value = input[fieldName];

  if (value === undefined || value === null) {
    if (required) {
      throw new BadRequestException(`${fieldName} must be provided.`);
    }

    return '';
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string.`);
  }

  return value;
}

export function parseUpsertSenderProfileBody(
  body: unknown,
): UpsertSenderProfileRequestBody {
  const input = ensureObject(body);

  return {
    fullName: readString(input, 'fullName'),
    addressLine1: readString(input, 'addressLine1'),
    addressLine2: readString(input, 'addressLine2', false) || undefined,
    city: readString(input, 'city'),
    region: readString(input, 'region'),
    postalCode: readString(input, 'postalCode'),
    countryCode: readString(input, 'countryCode'),
    preferredLocale: readString(input, 'preferredLocale'),
    preferredCurrency: readString(input, 'preferredCurrency'),
  };
}
