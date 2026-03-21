import {
  Order,
  PrintableAssetStatus,
  RenderPhotoFit,
  TemplateOrientation,
  ShippingType,
  ShippingZone,
} from '@prisma/client';

export type OrderRecord = Pick<
  Order,
  | 'userId'
  | 'id'
  | 'draftId'
  | 'contactId'
  | 'contactFirstName'
  | 'contactLastName'
  | 'templateId'
  | 'templateSlug'
  | 'templateName'
  | 'templateWidthMm'
  | 'templateHeightMm'
  | 'templateOrientation'
  | 'templatePreviewLabel'
  | 'templateAccentHex'
  | 'templateSurfaceHex'
  | 'templateTextHex'
  | 'renderPreviewId'
  | 'artifactObjectId'
  | 'printableAssetObjectId'
  | 'printableAssetStatus'
  | 'printableAssetGeneratedAt'
  | 'printableAssetError'
  | 'photoObjectId'
  | 'status'
  | 'shippingType'
  | 'shippingZone'
  | 'currency'
  | 'subtotalCents'
  | 'taxCents'
  | 'totalCents'
  | 'stripeCheckoutSessionId'
  | 'stripePaymentIntentId'
  | 'paidAt'
  | 'lastPaymentError'
  | 'headline'
  | 'message'
  | 'fieldValues'
  | 'photoFit'
  | 'scheduledFor'
  | 'occurrenceDate'
  | 'createdAt'
  | 'updatedAt'
>;

export interface DraftOrderConversionRecord {
  id: string;
  userId: string;
  status:
    | 'APPROVED'
    | 'SKIPPED'
    | 'READY_FOR_REVIEW'
    | 'SCHEDULED'
    | 'PROCESSING';
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  };
  template: {
    id: string;
    slug: string;
    name: string;
    widthMm: number;
    heightMm: number;
    orientation: TemplateOrientation;
    previewLabel: string;
    accentHex: string;
    surfaceHex: string;
    textHex: string;
  };
  renderPreview: {
    id: string;
    artifactObjectId: string;
  } | null;
  photoObjectId: string | null;
  photoFit: RenderPhotoFit | null;
  headline: string;
  message: string;
  fieldValues: Record<string, string>;
  scheduledFor: Date;
  occurrenceDate: Date;
}

export interface CreateOrderParams {
  userId: string;
  draftId: string;
  contactId: string;
  contactFirstName: string;
  contactLastName: string;
  templateId: string;
  templateSlug: string;
  templateName: string;
  templateWidthMm: number;
  templateHeightMm: number;
  templateOrientation: TemplateOrientation;
  templatePreviewLabel: string;
  templateAccentHex: string;
  templateSurfaceHex: string;
  templateTextHex: string;
  renderPreviewId: string;
  artifactObjectId: string;
  printableAssetObjectId?: string | null;
  printableAssetStatus?: PrintableAssetStatus;
  printableAssetGeneratedAt?: Date | null;
  printableAssetError?: string | null;
  photoObjectId: string | null;
  status: 'AWAITING_PAYMENT';
  shippingType?: ShippingType | null;
  shippingZone?: ShippingZone | null;
  currency?: string | null;
  subtotalCents?: number | null;
  taxCents?: number | null;
  totalCents?: number | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paidAt?: Date | null;
  lastPaymentError?: string | null;
  headline: string;
  message: string;
  fieldValues: Record<string, string>;
  photoFit: RenderPhotoFit | null;
  scheduledFor: Date;
  occurrenceDate: Date;
}

export interface PrintableAssetJobRecord {
  id: string;
  userId: string;
  templateSlug: string;
  templateName: string;
  templateWidthMm: number;
  templateHeightMm: number;
  templatePreviewLabel: string;
  templateAccentHex: string;
  templateSurfaceHex: string;
  templateTextHex: string;
  headline: string;
  message: string;
  photoObjectId: string | null;
  photoFit: RenderPhotoFit | null;
}
