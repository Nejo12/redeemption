import { Order, RenderPhotoFit } from '@prisma/client';

export type OrderRecord = Pick<
  Order,
  | 'id'
  | 'draftId'
  | 'contactId'
  | 'contactFirstName'
  | 'contactLastName'
  | 'templateId'
  | 'templateSlug'
  | 'templateName'
  | 'renderPreviewId'
  | 'artifactObjectId'
  | 'photoObjectId'
  | 'status'
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
  renderPreviewId: string;
  artifactObjectId: string;
  photoObjectId: string | null;
  status: 'AWAITING_PAYMENT';
  headline: string;
  message: string;
  fieldValues: Record<string, string>;
  photoFit: RenderPhotoFit | null;
  scheduledFor: Date;
  occurrenceDate: Date;
}
