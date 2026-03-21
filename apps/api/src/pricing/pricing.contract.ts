export type OrderFormatValue = 'POSTCARD' | 'FOLDED_CARD';

export type ShippingTypeValue = 'STANDARD' | 'PRIORITY';

export type ShippingZoneValue = 'DOMESTIC' | 'INTERNATIONAL';

export type PricingLineItemCodeValue = 'PRINT' | 'SHIPPING' | 'TAX';

export type TaxStrategyValue = 'MVP_SENDER_COUNTRY_BASELINE';

export interface PricingLineItemView {
  code: PricingLineItemCodeValue;
  label: string;
  amountCents: number;
}

export interface OrderPricingView {
  orderId: string;
  currency: string;
  format: OrderFormatValue;
  shippingType: ShippingTypeValue;
  shippingZone: ShippingZoneValue;
  destinationCountryCode: string;
  senderCountryCode: string;
  taxRateBps: number;
  taxStrategy: TaxStrategyValue;
  lineItems: PricingLineItemView[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  generatedAt: string;
}

export interface OrderPricingResponse {
  pricing: OrderPricingView;
}
