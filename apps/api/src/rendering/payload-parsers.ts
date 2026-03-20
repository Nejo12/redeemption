import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CreateRenderPreviewRequestBody,
  RenderPhotoFitValue,
  RenderPreviewFieldValues,
} from './rendering.contract';

const renderPhotoFitValues: ReadonlySet<RenderPhotoFitValue> = new Set([
  'FIT',
  'COVER',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseFieldValues(value: unknown): RenderPreviewFieldValues {
  if (!isRecord(value)) {
    throw new UnprocessableEntityException(
      'fieldValues must be an object keyed by template field ids.',
    );
  }

  const fieldValues: RenderPreviewFieldValues = {};

  for (const [key, fieldValue] of Object.entries(value)) {
    if (typeof fieldValue !== 'string') {
      throw new UnprocessableEntityException(
        `Field "${key}" must be sent as a string value.`,
      );
    }

    fieldValues[key] = fieldValue;
  }

  return fieldValues;
}

function parsePhotoFit(value: unknown): RenderPhotoFitValue | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' || !renderPhotoFitValues.has(value as never)) {
    throw new UnprocessableEntityException('photoFit must be FIT or COVER.');
  }

  return value as RenderPhotoFitValue;
}

function parsePhotoObjectId(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new UnprocessableEntityException('photoObjectId must be a string.');
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  return trimmedValue;
}

export function parseCreateRenderPreviewBody(
  body: unknown,
): CreateRenderPreviewRequestBody {
  if (!isRecord(body)) {
    throw new BadRequestException('Preview payload must be an object.');
  }

  if (typeof body.templateSlug !== 'string' || !body.templateSlug.trim()) {
    throw new UnprocessableEntityException('templateSlug is required.');
  }

  return {
    templateSlug: body.templateSlug.trim(),
    fieldValues: parseFieldValues(body.fieldValues),
    photoObjectId: parsePhotoObjectId(body.photoObjectId),
    photoFit: parsePhotoFit(body.photoFit),
  };
}
