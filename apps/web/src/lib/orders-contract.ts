import { RenderPhotoFitValue } from "@/lib/moments-contract";
import { ShippingTypeValue, ShippingZoneValue } from "@/lib/pricing-contract";

export type OrderStatusValue =
  | "AWAITING_PAYMENT"
  | "PAYMENT_FAILED"
  | "PAID"
  | "FULFILLMENT_PENDING"
  | "FULFILLED"
  | "CANCELLED";

export type PrintableAssetStatusValue = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface OrderView {
  id: string;
  draftId: string;
  contactId: string;
  contactFirstName: string;
  contactLastName: string;
  templateId: string;
  templateSlug: string;
  templateName: string;
  templateWidthMm: number;
  templateHeightMm: number;
  templateOrientation: "PORTRAIT" | "LANDSCAPE";
  templatePreviewLabel: string;
  templateAccentHex: string;
  templateSurfaceHex: string;
  templateTextHex: string;
  renderPreviewId: string;
  artifactObjectId: string;
  printableAssetObjectId: string | null;
  printableAssetStatus: PrintableAssetStatusValue;
  printableAssetGeneratedAt: string | null;
  printableAssetError: string | null;
  photoObjectId: string | null;
  status: OrderStatusValue;
  shippingType: ShippingTypeValue | null;
  shippingZone: ShippingZoneValue | null;
  currency: string | null;
  subtotalCents: number | null;
  taxCents: number | null;
  totalCents: number | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
  lastPaymentError: string | null;
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
