import { Prisma, Template, TemplateField } from '@prisma/client';

export const templateSelect = {
  id: true,
  slug: true,
  name: true,
  category: true,
  summary: true,
  description: true,
  widthMm: true,
  heightMm: true,
  orientation: true,
  previewLabel: true,
  previewHeadline: true,
  previewMessage: true,
  accentHex: true,
  surfaceHex: true,
  textHex: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  fields: {
    orderBy: {
      position: 'asc',
    },
    select: {
      key: true,
      label: true,
      kind: true,
      required: true,
      placeholder: true,
      maxLength: true,
      position: true,
    },
  },
} satisfies Prisma.TemplateSelect;

export type TemplateFieldRecord = Pick<
  TemplateField,
  | 'key'
  | 'label'
  | 'kind'
  | 'required'
  | 'placeholder'
  | 'maxLength'
  | 'position'
>;

export type TemplateRecord = Pick<
  Template,
  | 'id'
  | 'slug'
  | 'name'
  | 'category'
  | 'summary'
  | 'description'
  | 'widthMm'
  | 'heightMm'
  | 'orientation'
  | 'previewLabel'
  | 'previewHeadline'
  | 'previewMessage'
  | 'accentHex'
  | 'surfaceHex'
  | 'textHex'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
> & {
  fields: TemplateFieldRecord[];
};
