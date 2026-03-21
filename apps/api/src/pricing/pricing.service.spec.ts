import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PricingRepository } from './pricing.repository';
import { PricingService } from './pricing.service';

class PricingRepositoryFake {
  private order: {
    id: string;
    userId: string;
    contactId: string;
    templateId: string;
    status: 'AWAITING_PAYMENT' | 'PAYMENT_FAILED' | 'PAID';
  } | null = {
    id: 'order_1',
    userId: 'user_1',
    contactId: 'contact_1',
    templateId: 'template_1',
    status: 'AWAITING_PAYMENT' as const,
  };

  private senderProfile = {
    fullName: 'Olaniyi',
    addressLine1: 'Street 1',
    addressLine2: null,
    city: 'Berlin',
    region: 'Berlin',
    postalCode: '10115',
    countryCode: 'DE',
    preferredLocale: 'de-DE',
    preferredCurrency: 'EUR',
  };

  private primaryAddress: {
    countryCode: string;
    validationStatus: 'VALID' | 'INVALID';
  } | null = {
    countryCode: 'DE',
    validationStatus: 'VALID' as const,
  };

  private template = {
    id: 'template_1',
    widthMm: 127,
    heightMm: 177,
  };

  findOrderById() {
    return Promise.resolve(this.order);
  }

  findSenderProfileByUserId() {
    return Promise.resolve(this.senderProfile);
  }

  findPrimaryAddressForContact() {
    return Promise.resolve(this.primaryAddress);
  }

  findTemplateById() {
    return Promise.resolve(this.template);
  }

  setPrimaryAddressCountryCode(countryCode: string) {
    if (!this.primaryAddress) {
      return;
    }

    this.primaryAddress = {
      ...this.primaryAddress,
      countryCode,
    };
  }

  setPrimaryAddressValidationStatus(validationStatus: 'VALID' | 'INVALID') {
    if (!this.primaryAddress) {
      return;
    }

    this.primaryAddress = {
      ...this.primaryAddress,
      validationStatus,
    };
  }

  removePrimaryAddress() {
    this.findPrimaryAddressForContact = () => Promise.resolve(null);
  }

  removeSenderProfileField(field: keyof typeof this.senderProfile) {
    this.senderProfile = {
      ...this.senderProfile,
      [field]: null,
    };
  }

  setTemplateSize(widthMm: number, heightMm: number) {
    this.template = {
      ...this.template,
      widthMm,
      heightMm,
    };
  }

  setOrderStatus(status: 'AWAITING_PAYMENT' | 'PAYMENT_FAILED' | 'PAID') {
    if (!this.order) {
      return;
    }

    this.order = {
      ...this.order,
      status,
    };
  }

  removeOrder() {
    this.findOrderById = () => Promise.resolve(null);
  }
}

describe('PricingService', () => {
  let repository: PricingRepositoryFake;
  let service: PricingService;

  beforeEach(() => {
    repository = new PricingRepositoryFake();
    service = new PricingService(repository as unknown as PricingRepository);
  });

  it('returns an itemized domestic standard quote for a folded card order', async () => {
    const response = await service.getOrderPricing(
      'user_1',
      'order_1',
      'STANDARD',
    );

    expect(response.pricing.currency).toBe('EUR');
    expect(response.pricing.format).toBe('FOLDED_CARD');
    expect(response.pricing.shippingZone).toBe('DOMESTIC');
    expect(response.pricing.subtotalCents).toBe(600);
    expect(response.pricing.taxCents).toBe(114);
    expect(response.pricing.totalCents).toBe(714);
    expect(response.pricing.lineItems).toEqual([
      {
        code: 'PRINT',
        label: 'Folded card print',
        amountCents: 420,
      },
      {
        code: 'SHIPPING',
        label: 'Standard shipping',
        amountCents: 180,
      },
      {
        code: 'TAX',
        label: 'VAT estimate (19%)',
        amountCents: 114,
      },
    ]);
  });

  it('returns an international priority quote for a postcard order', async () => {
    repository.setPrimaryAddressCountryCode('FR');
    repository.setTemplateSize(105, 148);

    const response = await service.getOrderPricing(
      'user_1',
      'order_1',
      'PRIORITY',
    );

    expect(response.pricing.format).toBe('POSTCARD');
    expect(response.pricing.shippingZone).toBe('INTERNATIONAL');
    expect(response.pricing.subtotalCents).toBe(1030);
    expect(response.pricing.taxCents).toBe(196);
    expect(response.pricing.totalCents).toBe(1226);
  });

  it('rejects pricing when the sender profile is not checkout-ready', async () => {
    repository.removeSenderProfileField('preferredCurrency');

    await expect(
      service.getOrderPricing('user_1', 'order_1', 'STANDARD'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects pricing when the primary address is invalid', async () => {
    repository.setPrimaryAddressValidationStatus('INVALID');

    await expect(
      service.getOrderPricing('user_1', 'order_1', 'STANDARD'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects pricing when the order is already paid', async () => {
    repository.setOrderStatus('PAID');

    await expect(
      service.getOrderPricing('user_1', 'order_1', 'STANDARD'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects pricing when the order cannot be found', async () => {
    repository.removeOrder();

    await expect(
      service.getOrderPricing('user_1', 'missing', 'STANDARD'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects pricing when no primary address exists', async () => {
    repository.removePrimaryAddress();

    await expect(
      service.getOrderPricing('user_1', 'order_1', 'STANDARD'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
