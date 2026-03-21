import { RenderPhotoFitValue } from "@/lib/moments-contract";

export type OrderStatusValue =
  | "AWAITING_PAYMENT"
  | "PAYMENT_FAILED"
  | "PAID"
  | "FULFILLMENT_PENDING"
  | "FULFILLED"
  | "CANCELLED";

export interface OrderView {
  id: string;
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
  status: OrderStatusValue;
  headline: string;
  message: string;
  fieldValues: Record<string, string>;
  photoFit: RenderPhotoFitValue | null;
  scheduledFor: string;
  occurrenceDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  order: OrderView;
}

export interface OrderListResponse {
  orders: OrderView[];
}
