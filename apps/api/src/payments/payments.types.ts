import {
  OrderStatus,
  PrintableAssetStatus,
  ShippingType,
  ShippingZone,
  PaymentWebhookEvent,
} from '@prisma/client';

export interface CheckoutOrderRecord {
  id: string;
  userId: string;
  status: OrderStatus;
  printableAssetStatus: PrintableAssetStatus;
  headline: string;
  templateName: string;
  contactFirstName: string;
  contactLastName: string;
}

export interface UpdateCheckoutSessionParams {
  orderId: string;
  shippingType: ShippingType;
  shippingZone: ShippingZone;
  currency: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  stripeCheckoutSessionId: string;
}

export interface MarkOrderPaidParams {
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  paidAt: Date;
}

export interface MarkOrderPaymentFailedParams {
  orderId: string;
  stripePaymentIntentId: string | null;
  lastPaymentError: string;
}

export type PaymentWebhookEventRecord = Pick<
  PaymentWebhookEvent,
  'id' | 'stripeEventId' | 'eventType' | 'createdAt' | 'processedAt'
>;
