import {
  Draft,
  DraftStatus,
  MomentApprovalMode,
  MomentDeliveryPreference,
  MomentEventType,
  RenderPhotoFit,
} from '@prisma/client';

export interface MomentContactSummaryRecord {
  id: string;
  firstName: string;
  lastName: string;
  birthday: Date | null;
}

export interface MomentTemplateSummaryRecord {
  id: string;
  slug: string;
  name: string;
}

export type DraftRecord = Pick<
  Draft,
  | 'id'
  | 'momentRuleId'
  | 'status'
  | 'scheduledFor'
  | 'draftReadyAt'
  | 'occurrenceDate'
  | 'headline'
  | 'message'
  | 'fieldValues'
  | 'photoObjectId'
  | 'photoFit'
  | 'renderPreviewId'
  | 'createdAt'
  | 'updatedAt'
> & {
  contact: MomentContactSummaryRecord;
  template: MomentTemplateSummaryRecord;
};

export interface MomentRuleRecord {
  id: string;
  name: string;
  eventType: MomentEventType;
  oneOffDate: Date | null;
  leadTimeDays: number;
  deliveryPreference: MomentDeliveryPreference;
  approvalMode: MomentApprovalMode;
  messageTemplate: string;
  photoObjectId: string | null;
  nextOccurrenceAt: Date | null;
  nextDraftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  contact: MomentContactSummaryRecord;
  template: MomentTemplateSummaryRecord;
  drafts: DraftRecord[];
}

export interface MomentCreationContext {
  user: {
    id: string;
    displayName: string | null;
    profile: {
      fullName: string | null;
    } | null;
  };
  contact: MomentContactSummaryRecord;
  template: {
    id: string;
    slug: string;
    name: string;
    fields: Array<{
      key: string;
      label: string;
      kind: 'TEXT' | 'TEXTAREA' | 'PHOTO';
      required: boolean;
      maxLength: number | null;
      position: number;
    }>;
  };
}

export interface CreateMomentRuleParams {
  userId: string;
  contactId: string;
  templateId: string;
  photoObjectId: string | null;
  name: string;
  eventType: MomentEventType;
  oneOffDate: Date | null;
  leadTimeDays: number;
  deliveryPreference: MomentDeliveryPreference;
  approvalMode: MomentApprovalMode;
  messageTemplate: string;
  nextOccurrenceAt: Date;
  nextDraftAt: Date;
}

export interface CreateDraftParams {
  userId: string;
  momentRuleId: string;
  contactId: string;
  templateId: string;
  photoObjectId: string | null;
  status: DraftStatus;
  scheduledFor: Date;
  draftReadyAt: Date;
  occurrenceDate: Date;
  headline: string;
  message: string;
  fieldValues: Record<string, string>;
  photoFit: RenderPhotoFit | null;
  renderPreviewId: string | null;
}

export interface DraftDueRecord {
  id: string;
  photoObjectId: string | null;
  photoFit: RenderPhotoFit | null;
  fieldValues: Record<string, string>;
  momentRuleId: string;
  template: MomentTemplateSummaryRecord;
}
