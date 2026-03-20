import { BadRequestException } from '@nestjs/common';
import { RelationshipTag } from '@prisma/client';
import { UpsertContactRequestBody } from './contacts.contract';

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
): string | undefined {
  const value = input[fieldName];

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new BadRequestException(`${fieldName} must be provided.`);
    }

    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string.`);
  }

  return value;
}

function parseRelationshipTag(
  value: string | undefined,
): RelationshipTag | undefined {
  if (!value) {
    return undefined;
  }

  if (
    value !== RelationshipTag.FAMILY &&
    value !== RelationshipTag.FRIEND &&
    value !== RelationshipTag.PARTNER &&
    value !== RelationshipTag.WORK
  ) {
    throw new BadRequestException(
      'relationshipTag must be one of FAMILY, FRIEND, PARTNER, or WORK.',
    );
  }

  return value;
}

function parseBirthday(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException('birthday must use YYYY-MM-DD format.');
  }

  return value;
}

function parseAddressIdArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new BadRequestException(
      'alternateAddressIds must be an array of strings.',
    );
  }

  return value.map((item) => {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new BadRequestException(
        'alternateAddressIds must contain non-empty strings.',
      );
    }

    return item.trim();
  });
}

export function parseUpsertContactBody(
  body: unknown,
): UpsertContactRequestBody {
  const input = ensureObject(body);
  const primaryAddressId = readString(input, 'primaryAddressId', false)?.trim();
  const alternateAddressIds = parseAddressIdArray(input.alternateAddressIds);

  if (primaryAddressId && alternateAddressIds?.includes(primaryAddressId)) {
    throw new BadRequestException(
      'primaryAddressId must be different from alternateAddressIds.',
    );
  }

  return {
    firstName: readString(input, 'firstName')!,
    lastName: readString(input, 'lastName')!,
    relationshipTag: parseRelationshipTag(
      readString(input, 'relationshipTag', false),
    ),
    birthday: parseBirthday(readString(input, 'birthday', false)),
    timezone: readString(input, 'timezone', false),
    notes: readString(input, 'notes', false),
    primaryAddressId,
    alternateAddressIds,
  };
}
