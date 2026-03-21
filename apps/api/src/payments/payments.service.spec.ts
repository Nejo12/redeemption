import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { PricingService } from '../pricing/pricing.service';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { StripeClientService } from './stripe-client.service';

class PaymentsRepositoryFake {
  checkoutOrder: {
    id: string;
    userId: string;
    status: 'AWAITING_PAYMENT' | 'PAYMENT_FAILED' | 'PAID';
    printableAssetStatus: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
    headline: string;
    templateName: string;
    contactFirstName: string;
    contactLastName: string;
  } | null = {
    id: 'order_1',
    userId: 'user_1',
    status: 'AWAITING_PAYMENT' as const,
    printableAssetStatus: 'READY' as const,
    headline: 'Mira Cole',
    templateName: 'Birthday Bloom',
    contactFirstName: 'Mira',
    contactLastName: 'Cole',
  };

  updateCheckoutSessionCalls: Array<Record<string, unknown>> = [];
  markOrderPaidCalls: Array<Record<string, unknown>> = [];
  markOrderPaymentFailedCalls: Array<Record<string, unknown>> = [];
  webhookEventAccepted = true;

  findCheckoutOrder() {
    return Promise.resolve(this.checkoutOrder);
  }

  updateCheckoutSession(params: Record<string, unknown>) {
    this.updateCheckoutSessionCalls.push(params);
    return Promise.resolve();
  }

  recordWebhookEvent() {
    return Promise.resolve(this.webhookEventAccepted);
  }

  markOrderPaid(params: Record<string, unknown>) {
    this.markOrderPaidCalls.push(params);
    return Promise.resolve();
  }

  markOrderPaymentFailed(params: Record<string, unknown>) {
    this.markOrderPaymentFailedCalls.push(params);
    return Promise.resolve();
  }
}

class PricingServiceFake {
  getOrderPricing() {
    return Promise.resolve({
      pricing: {
        orderId: 'order_1',
        currency: 'EUR',
        format: 'FOLDED_CARD' as const,
        shippingType: 'STANDARD' as const,
        shippingZone: 'DOMESTIC' as const,
        destinationCountryCode: 'DE',
        senderCountryCode: 'DE',
        taxRateBps: 1900,
        taxStrategy: 'MVP_SENDER_COUNTRY_BASELINE' as const,
        lineItems: [
          {
            code: 'PRINT' as const,
            label: 'Folded card print',
            amountCents: 420,
          },
          {
            code: 'SHIPPING' as const,
            label: 'Standard shipping',
            amountCents: 180,
          },
          {
            code: 'TAX' as const,
            label: 'VAT estimate (19%)',
            amountCents: 114,
          },
        ],
        subtotalCents: 600,
        taxCents: 114,
        totalCents: 714,
        generatedAt: '2026-03-21T00:00:00.000Z',
      },
    });
  }
}

class StripeClientServiceFake {
  session = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.test/session',
    expires_at: 1_800_000_000,
  };

  event: Stripe.Event = {
    id: 'evt_test_1',
    object: 'event',
    api_version: '2025-02-24.acacia',
    created: 1_700_000_000,
    data: {
      object: {
        id: 'cs_test_123',
        object: 'checkout.session',
        metadata: {
          orderId: 'order_1',
        },
        payment_intent: 'pi_123',
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_1',
      idempotency_key: null,
    },
    type: 'checkout.session.completed',
  } as unknown as Stripe.Event;

  createHostedCheckoutSession() {
    return Promise.resolve(this.session as unknown as Stripe.Checkout.Session);
  }

  constructWebhookEvent() {
    return this.event;
  }
}

describe('PaymentsService', () => {
  let paymentsRepository: PaymentsRepositoryFake;
  let pricingService: PricingServiceFake;
  let stripeClientService: StripeClientServiceFake;
  let service: PaymentsService;

  beforeEach(() => {
    paymentsRepository = new PaymentsRepositoryFake();
    pricingService = new PricingServiceFake();
    stripeClientService = new StripeClientServiceFake();
    process.env.APP_BASE_URL =
      'https://redeemption-olaniyis-projects.vercel.app';

    service = new PaymentsService(
      pricingService as unknown as PricingService,
      paymentsRepository as unknown as PaymentsRepository,
      stripeClientService as unknown as StripeClientService,
    );
  });

  it('creates a hosted checkout session and stores the payment snapshot', async () => {
    const response = await service.createCheckoutSession('user_1', 'order_1', {
      shippingType: 'STANDARD',
    });

    expect(response.checkoutSessionId).toBe('cs_test_123');
    expect(response.checkoutUrl).toBe('https://checkout.stripe.test/session');
    expect(paymentsRepository.updateCheckoutSessionCalls).toHaveLength(1);
    expect(paymentsRepository.updateCheckoutSessionCalls[0]).toMatchObject({
      orderId: 'order_1',
      shippingType: 'STANDARD',
      shippingZone: 'DOMESTIC',
      currency: 'EUR',
      subtotalCents: 600,
      taxCents: 114,
      totalCents: 714,
      stripeCheckoutSessionId: 'cs_test_123',
    });
  });

  it('rejects checkout for paid orders', async () => {
    if (!paymentsRepository.checkoutOrder) {
      throw new Error('Expected checkout order fixture.');
    }

    paymentsRepository.checkoutOrder = {
      ...paymentsRepository.checkoutOrder,
      status: 'PAID',
    };

    await expect(
      service.createCheckoutSession('user_1', 'order_1', {
        shippingType: 'STANDARD',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects checkout when the order cannot be found', async () => {
    paymentsRepository.findCheckoutOrder = () => Promise.resolve(null);

    await expect(
      service.createCheckoutSession('user_1', 'missing', {
        shippingType: 'STANDARD',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects checkout until the printable asset is ready', async () => {
    if (!paymentsRepository.checkoutOrder) {
      throw new Error('Expected checkout order fixture.');
    }

    paymentsRepository.checkoutOrder = {
      ...paymentsRepository.checkoutOrder,
      printableAssetStatus: 'PROCESSING',
    };

    await expect(
      service.createCheckoutSession('user_1', 'order_1', {
        shippingType: 'STANDARD',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks an order paid from checkout.session.completed', async () => {
    const request = {
      headers: {
        'stripe-signature': 'sig_test',
      },
      rawBody: Buffer.from('{}'),
    } as unknown as Request;

    const response = await service.handleStripeWebhook(request);

    expect(response).toEqual({ received: true });
    expect(paymentsRepository.markOrderPaidCalls).toHaveLength(1);
    expect(paymentsRepository.markOrderPaidCalls[0]).toMatchObject({
      stripeCheckoutSessionId: 'cs_test_123',
      stripePaymentIntentId: 'pi_123',
    });
  });

  it('returns early for duplicate webhook events', async () => {
    paymentsRepository.webhookEventAccepted = false;
    const request = {
      headers: {
        'stripe-signature': 'sig_test',
      },
      rawBody: Buffer.from('{}'),
    } as unknown as Request;

    const response = await service.handleStripeWebhook(request);

    expect(response).toEqual({ received: true });
    expect(paymentsRepository.markOrderPaidCalls).toHaveLength(0);
  });

  it('marks an order payment failure from payment_intent.payment_failed', async () => {
    stripeClientService.event = {
      ...stripeClientService.event,
      id: 'evt_test_failed',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_456',
          object: 'payment_intent',
          metadata: {
            orderId: 'order_1',
          },
          last_payment_error: {
            message: 'Your card was declined.',
          },
        },
      },
    } as unknown as Stripe.Event;

    const request = {
      headers: {
        'stripe-signature': 'sig_test',
      },
      rawBody: Buffer.from('{}'),
    } as unknown as Request;

    await service.handleStripeWebhook(request);

    expect(paymentsRepository.markOrderPaymentFailedCalls).toHaveLength(1);
    expect(paymentsRepository.markOrderPaymentFailedCalls[0]).toMatchObject({
      orderId: 'order_1',
      stripePaymentIntentId: 'pi_456',
      lastPaymentError: 'Your card was declined.',
    });
  });
});
