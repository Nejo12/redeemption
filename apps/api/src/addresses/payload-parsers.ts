import { BadRequestException } from '@nestjs/common';
import { UpsertAddressRequestBody } from './addresses.contract';

function ensureBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Address payload must be an object.');
  }

  return body as Record<string, unknown>;
}

function parseRequiredTrimmedString(
  body: Record<string, unknown>,
  key: keyof UpsertAddressRequestBody,
  label: string,
): string {
  const value = body[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`${label} is required.`);
  }

  return value.trim();
}

function parseOptionalTrimmedString(
  body: Record<string, unknown>,
  key: keyof UpsertAddressRequestBody,
): string | undefined {
  const value = body[key];
  if (value == null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`${String(key)} must be a string.`);
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function parseUpsertAddressBody(
  body: unknown,
): UpsertAddressRequestBody {
  const payload = ensureBody(body);
  const countryCode = parseRequiredTrimmedString(
    payload,
    'countryCode',
    'Country code',
  ).toUpperCase();

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    throw new BadRequestException(
      'Country code must be a two-letter ISO country code.',
    );
  }

  return {
    line1: parseRequiredTrimmedString(payload, 'line1', 'Address line 1'),
    line2: parseOptionalTrimmedString(payload, 'line2'),
    city: parseRequiredTrimmedString(payload, 'city', 'City'),
    region: parseOptionalTrimmedString(payload, 'region'),
    postalCode: parseRequiredTrimmedString(
      payload,
      'postalCode',
      'Postal code',
    ),
    countryCode,
  };
}
