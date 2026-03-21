import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../database/prisma.service';
import {
  CheckoutOrderRecord,
  MarkOrderPaidParams,
  MarkOrderPaymentFailedParams,
  UpdateCheckoutSessionParams,
} from './payments.types';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCheckoutOrder(
    userId: string,
    orderId: string,
  ): Promise<CheckoutOrderRecord | null> {
    return this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        printableAssetStatus: true,
        headline: true,
        templateName: true,
        contactFirstName: true,
        contactLastName: true,
      },
    });
  }

  updateCheckoutSession(params: UpdateCheckoutSessionParams): Promise<void> {
    return this.prisma.order
      .update({
        where: {
          id: params.orderId,
        },
        data: {
          shippingType: params.shippingType,
          shippingZone: params.shippingZone,
          currency: params.currency,
          subtotalCents: params.subtotalCents,
          taxCents: params.taxCents,
          totalCents: params.totalCents,
          stripeCheckoutSessionId: params.stripeCheckoutSessionId,
          lastPaymentError: null,
        },
      })
      .then(() => undefined);
  }

  async recordWebhookEvent(
    stripeEventId: string,
    eventType: string,
  ): Promise<boolean> {
    try {
      await this.prisma.paymentWebhookEvent.create({
        data: {
          stripeEventId,
          eventType,
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return false;
      }

      throw error;
    }
  }

  async markOrderPaid(params: MarkOrderPaidParams): Promise<void> {
    await this.prisma.order.updateMany({
      where: {
        stripeCheckoutSessionId: params.stripeCheckoutSessionId,
        NOT: {
          status: 'PAID',
        },
      },
      data: {
        status: 'PAID',
        stripePaymentIntentId: params.stripePaymentIntentId,
        paidAt: params.paidAt,
        lastPaymentError: null,
      },
    });
  }

  async markOrderPaymentFailed(
    params: MarkOrderPaymentFailedParams,
  ): Promise<void> {
    await this.prisma.order.updateMany({
      where: {
        id: params.orderId,
        status: {
          not: 'PAID',
        },
      },
      data: {
        status: 'PAYMENT_FAILED',
        stripePaymentIntentId: params.stripePaymentIntentId,
        lastPaymentError: params.lastPaymentError,
      },
    });
  }
}
