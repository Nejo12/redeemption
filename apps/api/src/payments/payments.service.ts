import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { PricingService } from '../pricing/pricing.service';
import {
  CheckoutSessionResponse,
  CreateCheckoutSessionRequestBody,
  StripeWebhookResponse,
} from './payments.contract';
import { PaymentsRepository } from './payments.repository';
import { StripeClientService } from './stripe-client.service';

type StripeWebhookRequest = Request & {
  rawBody?: Buffer;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly pricingService: PricingService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly stripeClientService: StripeClientService,
  ) {}

  async createCheckoutSession(
    userId: string,
    orderId: string,
    input: CreateCheckoutSessionRequestBody,
  ): Promise<CheckoutSessionResponse> {
    const order = await this.paymentsRepository.findCheckoutOrder(
      userId,
      orderId,
    );
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.status === 'PAID') {
      throw new BadRequestException(
        'Paid orders cannot start a new checkout session.',
      );
    }

    if (
      order.status !== 'AWAITING_PAYMENT' &&
      order.status !== 'PAYMENT_FAILED'
    ) {
      throw new BadRequestException(
        'Checkout is only available for unpaid orders.',
      );
    }

    if (order.printableAssetStatus !== 'READY') {
      throw new BadRequestException(
        'Checkout requires a ready printable asset for the order.',
      );
    }

    const pricingResponse = await this.pricingService.getOrderPricing(
      userId,
      orderId,
      input.shippingType,
    );
    const pricing = pricingResponse.pricing;
    const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';

    const session = await this.stripeClientService.createHostedCheckoutSession({
      orderId,
      headline: order.headline,
      successUrl: `${appBaseUrl}/moments?checkout=success&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appBaseUrl}/moments?checkout=cancelled&orderId=${orderId}`,
      currency: pricing.currency,
      lineItems: pricing.lineItems.map((lineItem) => ({
        label: lineItem.label,
        amountCents: lineItem.amountCents,
      })),
      metadata: {
        orderId,
        userId,
        shippingType: pricing.shippingType,
      },
    });

    if (!session.url) {
      throw new BadRequestException(
        'Stripe checkout session did not return a hosted URL.',
      );
    }

    await this.paymentsRepository.updateCheckoutSession({
      orderId,
      shippingType: pricing.shippingType,
      shippingZone: pricing.shippingZone,
      currency: pricing.currency,
      subtotalCents: pricing.subtotalCents,
      taxCents: pricing.taxCents,
      totalCents: pricing.totalCents,
      stripeCheckoutSessionId: session.id,
    });

    return {
      orderId,
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : null,
    };
  }

  async handleStripeWebhook(
    request: StripeWebhookRequest,
  ): Promise<StripeWebhookResponse> {
    const signature = request.headers['stripe-signature'];
    if (typeof signature !== 'string') {
      throw new BadRequestException('stripe-signature header is required.');
    }

    if (!request.rawBody) {
      throw new BadRequestException('Raw webhook body is required.');
    }

    const event = this.stripeClientService.constructWebhookEvent(
      request.rawBody,
      signature,
    );
    const isFirstProcessing = await this.paymentsRepository.recordWebhookEvent(
      event.id,
      event.type,
    );

    if (!isFirstProcessing) {
      return {
        received: true,
      };
    }

    await this.handleStripeEvent(event);

    return {
      received: true,
    };
  }

  private async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        return;
      case 'checkout.session.expired':
        await this.handleCheckoutSessionExpired(event.data.object);
        return;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object);
        return;
      default:
        return;
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    await this.paymentsRepository.markOrderPaid({
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
      paidAt: new Date(),
    });
  }

  private async handleCheckoutSessionExpired(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return;
    }

    await this.paymentsRepository.markOrderPaymentFailed({
      orderId,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
      lastPaymentError: 'Checkout session expired before payment completed.',
    });
  }

  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      return;
    }

    const failureMessage =
      paymentIntent.last_payment_error?.message ??
      'Payment failed before checkout completion.';

    await this.paymentsRepository.markOrderPaymentFailed({
      orderId,
      stripePaymentIntentId: paymentIntent.id,
      lastPaymentError: failureMessage,
    });
  }
}
