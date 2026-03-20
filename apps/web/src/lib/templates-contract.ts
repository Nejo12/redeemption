export type TemplateCategoryValue =
  | "BIRTHDAY"
  | "GENERAL"
  | "HOLIDAY"
  | "THANK_YOU"
  | "ANNIVERSARY";

export type TemplateOrientationValue = "PORTRAIT" | "LANDSCAPE";

export type TemplateFieldKindValue = "TEXT" | "TEXTAREA" | "PHOTO";

export interface TemplateFieldView {
  key: string;
  label: string;
  kind: TemplateFieldKindValue;
  required: boolean;
  placeholder: string | null;
  maxLength: number | null;
  position: number;
}

export interface TemplateView {
  id: string;
  slug: string;
  name: string;
  category: TemplateCategoryValue;
  summary: string;
  description: string;
  widthMm: number;
  heightMm: number;
  orientation: TemplateOrientationValue;
  previewLabel: string;
  previewHeadline: string;
  previewMessage: string;
  accentHex: string;
  surfaceHex: string;
  textHex: string;
  isActive: boolean;
  fields: TemplateFieldView[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateListResponse {
  templates: TemplateView[];
  availableCategories: TemplateCategoryValue[];
}

export interface TemplateResponse {
  template: TemplateView;
}

export const templateCategoryLabels: Record<TemplateCategoryValue, string> = {
  BIRTHDAY: "Birthday",
  GENERAL: "General",
  HOLIDAY: "Holiday",
  THANK_YOU: "Thank You",
  ANNIVERSARY: "Anniversary",
};

export function getTemplateDimensionsLabel(template: TemplateView): string {
  return `${template.widthMm} x ${template.heightMm} mm`;
}
