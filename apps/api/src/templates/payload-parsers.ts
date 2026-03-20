import { BadRequestException } from '@nestjs/common';
import { TemplateCategoryValue } from './templates.contract';

export const templateCategoryValues: TemplateCategoryValue[] = [
  'BIRTHDAY',
  'GENERAL',
  'HOLIDAY',
  'THANK_YOU',
  'ANNIVERSARY',
];

export function parseTemplateCategory(
  value: string | undefined,
): TemplateCategoryValue | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.trim().toUpperCase() as TemplateCategoryValue;
  if (!templateCategoryValues.includes(normalized)) {
    throw new BadRequestException(
      `category must be one of: ${templateCategoryValues.join(', ')}.`,
    );
  }

  return normalized;
}
