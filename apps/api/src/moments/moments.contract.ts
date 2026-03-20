export type MomentEventTypeValue = 'CONTACT_BIRTHDAY' | 'ONE_OFF_DATE';
export type MomentDeliveryPreferenceValue = 'ARRIVE_BY' | 'SHIP_ON';
export type MomentApprovalModeValue = 'ALWAYS_ASK';
export type DraftStatusValue = 'SCHEDULED' | 'READY_FOR_REVIEW';
export type RenderPhotoFitValue = 'FIT' | 'COVER';

export interface MomentContactSummaryView {
  id: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
}

export interface MomentTemplateSummaryView {
  id: string;
  slug: string;
  name: string;
}

export interface DraftView {
  id: string;
  momentRuleId: string;
  contact: MomentContactSummaryView;
  template: MomentTemplateSummaryView;
  status: DraftStatusValue;
  scheduledFor: string;
  draftReadyAt: string;
  occurrenceDate: string;
  headline: string;
  message: string;
  fieldValues: Record<string, string>;
  photoObjectId: string | null;
  photoFit: RenderPhotoFitValue | null;
  renderPreviewId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MomentRuleView {
  id: string;
  name: string;
  eventType: MomentEventTypeValue;
  oneOffDate: string | null;
  leadTimeDays: number;
  deliveryPreference: MomentDeliveryPreferenceValue;
  approvalMode: MomentApprovalModeValue;
  messageTemplate: string;
  photoObjectId: string | null;
  nextOccurrenceAt: string | null;
  nextDraftAt: string | null;
  contact: MomentContactSummaryView;
  template: MomentTemplateSummaryView;
  nextDraft: DraftView | null;
  createdAt: string;
  updatedAt: string;
}

export interface MomentRuleResponse {
  moment: MomentRuleView;
}

export interface MomentRuleListResponse {
  moments: MomentRuleView[];
}

export interface DraftListResponse {
  drafts: DraftView[];
}

export interface CreateMomentRuleRequestBody {
  name: string;
  contactId: string;
  templateId: string;
  eventType: MomentEventTypeValue;
  oneOffDate: string | null;
  leadTimeDays: number;
  deliveryPreference: MomentDeliveryPreferenceValue;
  approvalMode: MomentApprovalModeValue;
  messageTemplate: string;
  photoObjectId: string | null;
  photoFit: RenderPhotoFitValue | null;
}
