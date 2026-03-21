import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderFormatValue,
  OrderPricingResponse,
  OrderPricingView,
  PricingLineItemView,
  ShippingTypeValue,
  ShippingZoneValue,
} from './pricing.contract';
import { PricingRepository } from './pricing.repository';
import { PricingOrderRecord } from './pricing.types';
import {
  SenderProfileRecord,
  senderProfileRequiredFields,
} from '../sender-profile/sender-profile.types';

type ReadySenderProfileRecord = SenderProfileRecord & {
  fullName: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  preferredLocale: string;
  preferredCurrency: string;
};

type SupportedCurrency = 'EUR' | 'USD' | 'GBP';

const printPriceByCurrency: Record<
  SupportedCurrency,
  Record<OrderFormatValue, number>
> = {
  EUR: {
    POSTCARD: 250,
    FOLDED_CARD: 420,
  },
  USD: {
    POSTCARD: 275,
    FOLDED_CARD: 460,
  },
  GBP: {
    POSTCARD: 225,
    FOLDED_CARD: 395,
  },
};

const shippingPriceByCurrency: Record<
  SupportedCurrency,
  Record<ShippingZoneValue, Record<ShippingTypeValue, number>>
> = {
  EUR: {
    DOMESTIC: {
      STANDARD: 180,
      PRIORITY: 320,
    },
    INTERNATIONAL: {
      STANDARD: 420,
      PRIORITY: 780,
    },
  },
  USD: {
    DOMESTIC: {
      STANDARD: 195,
      PRIORITY: 360,
    },
    INTERNATIONAL: {
      STANDARD: 450,
      PRIORITY: 820,
    },
  },
  GBP: {
    DOMESTIC: {
      STANDARD: 160,
      PRIORITY: 290,
    },
    INTERNATIONAL: {
      STANDARD: 390,
      PRIORITY: 720,
    },
  },
};

const taxRateBpsBySenderCountry: Record<string, number> = {
  DE: 1900,
  FR: 2000,
  NL: 2100,
  ES: 2100,
  IT: 2200,
  IE: 2300,
  GB: 2000,
  US: 0,
};

@Injectable()
export class PricingService {
  constructor(private readonly pricingRepository: PricingRepository) {}

  async getOrderPricing(
    userId: string,
    orderId: string,
    shippingType: ShippingTypeValue,
  ): Promise<OrderPricingResponse> {
    const order = await this.pricingRepository.findOrderById(userId, orderId);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    this.assertOrderCanBePriced(order);

    const [senderProfile, primaryAddress, template] = await Promise.all([
      this.pricingRepository.findSenderProfileByUserId(userId),
      this.pricingRepository.findPrimaryAddressForContact(
        userId,
        order.contactId,
      ),
      this.pricingRepository.findTemplateById(order.templateId),
    ]);

    const readyProfile = this.assertSenderProfileReady(senderProfile);
    if (!primaryAddress) {
      throw new BadRequestException(
        'A primary contact address is required before pricing.',
      );
    }

    if (primaryAddress.validationStatus !== 'VALID') {
      throw new BadRequestException(
        'The primary contact address must be valid before pricing.',
      );
    }

    if (!template) {
      throw new NotFoundException('Template metadata not found for pricing.');
    }

    const currency = this.assertSupportedCurrency(
      readyProfile.preferredCurrency,
    );
    const format = this.detectOrderFormat(template.widthMm, template.heightMm);
    const shippingZone = this.determineShippingZone(
      readyProfile.countryCode,
      primaryAddress.countryCode,
    );

    const printCents = printPriceByCurrency[currency][format];
    const shippingCents =
      shippingPriceByCurrency[currency][shippingZone][shippingType];
    const subtotalCents = printCents + shippingCents;
    const taxRateBps = taxRateBpsBySenderCountry[readyProfile.countryCode] ?? 0;
    const taxCents = Math.round((subtotalCents * taxRateBps) / 10000);
    const totalCents = subtotalCents + taxCents;

    const lineItems: PricingLineItemView[] = [
      {
        code: 'PRINT',
        label: `${format === 'FOLDED_CARD' ? 'Folded card' : 'Postcard'} print`,
        amountCents: printCents,
      },
      {
        code: 'SHIPPING',
        label: `${shippingType === 'PRIORITY' ? 'Priority' : 'Standard'} shipping`,
        amountCents: shippingCents,
      },
      {
        code: 'TAX',
        label: taxRateBps > 0 ? `VAT estimate (${taxRateBps / 100}%)` : 'Tax',
        amountCents: taxCents,
      },
    ];

    return {
      pricing: this.toPricingView({
        orderId: order.id,
        currency,
        format,
        shippingType,
        shippingZone,
        destinationCountryCode: primaryAddress.countryCode,
        senderCountryCode: readyProfile.countryCode,
        taxRateBps,
        lineItems,
        subtotalCents,
        taxCents,
        totalCents,
      }),
    };
  }

  private assertOrderCanBePriced(order: PricingOrderRecord): void {
    if (
      order.status === 'AWAITING_PAYMENT' ||
      order.status === 'PAYMENT_FAILED'
    ) {
      return;
    }

    throw new BadRequestException(
      'Pricing is only available for unpaid orders.',
    );
  }

  private assertSenderProfileReady(
    profile: Awaited<
      ReturnType<PricingRepository['findSenderProfileByUserId']>
    >,
  ): ReadySenderProfileRecord {
    const missingFields = senderProfileRequiredFields.filter(
      (field) => !profile?.[field],
    );

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Sender profile must be ready for checkout before pricing. Missing: ${missingFields.join(', ')}.`,
      );
    }

    return profile as ReadySenderProfileRecord;
  }

  private assertSupportedCurrency(currency: string): SupportedCurrency {
    if (currency === 'EUR' || currency === 'USD' || currency === 'GBP') {
      return currency;
    }

    throw new BadRequestException(
      'preferredCurrency must be one of EUR, USD, or GBP for MVP pricing.',
    );
  }

  private detectOrderFormat(
    widthMm: number,
    heightMm: number,
  ): OrderFormatValue {
    return Math.max(widthMm, heightMm) >= 170 ? 'FOLDED_CARD' : 'POSTCARD';
  }

  private determineShippingZone(
    senderCountryCode: string,
    destinationCountryCode: string,
  ): ShippingZoneValue {
    return senderCountryCode === destinationCountryCode
      ? 'DOMESTIC'
      : 'INTERNATIONAL';
  }

  private toPricingView(input: {
    orderId: string;
    currency: SupportedCurrency;
    format: OrderFormatValue;
    shippingType: ShippingTypeValue;
    shippingZone: ShippingZoneValue;
    destinationCountryCode: string;
    senderCountryCode: string;
    taxRateBps: number;
    lineItems: PricingLineItemView[];
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
  }): OrderPricingView {
    return {
      orderId: input.orderId,
      currency: input.currency,
      format: input.format,
      shippingType: input.shippingType,
      shippingZone: input.shippingZone,
      destinationCountryCode: input.destinationCountryCode,
      senderCountryCode: input.senderCountryCode,
      taxRateBps: input.taxRateBps,
      taxStrategy: 'MVP_SENDER_COUNTRY_BASELINE',
      lineItems: input.lineItems,
      subtotalCents: input.subtotalCents,
      taxCents: input.taxCents,
      totalCents: input.totalCents,
      generatedAt: new Date().toISOString(),
    };
  }
}
