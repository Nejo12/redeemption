import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateOrderParams,
  DraftOrderConversionRecord,
  OrderRecord,
  PrintableAssetJobRecord,
} from './orders.types';

const orderSelect = {
  id: true,
  userId: true,
  draftId: true,
  contactId: true,
  contactFirstName: true,
  contactLastName: true,
  templateId: true,
  templateSlug: true,
  templateName: true,
  templateWidthMm: true,
  templateHeightMm: true,
  templateOrientation: true,
  templatePreviewLabel: true,
  templateAccentHex: true,
  templateSurfaceHex: true,
  templateTextHex: true,
  renderPreviewId: true,
  artifactObjectId: true,
  printableAssetObjectId: true,
  printableAssetStatus: true,
  printableAssetGeneratedAt: true,
  printableAssetError: true,
  photoObjectId: true,
  status: true,
  shippingType: true,
  shippingZone: true,
  currency: true,
  subtotalCents: true,
  taxCents: true,
  totalCents: true,
  stripeCheckoutSessionId: true,
  stripePaymentIntentId: true,
  paidAt: true,
  lastPaymentError: true,
  headline: true,
  message: true,
  fieldValues: true,
  photoFit: true,
  scheduledFor: true,
  occurrenceDate: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrdersByUserId(userId: string): Promise<OrderRecord[]> {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: [{ createdAt: 'desc' }],
      select: orderSelect,
    });
  }

  findByDraftId(userId: string, draftId: string): Promise<OrderRecord | null> {
    return this.prisma.order.findFirst({
      where: {
        userId,
        draftId,
      },
      select: orderSelect,
    });
  }

  findById(orderId: string): Promise<OrderRecord | null> {
    return this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: orderSelect,
    });
  }

  findDraftForConversion(
    userId: string,
    draftId: string,
  ): Promise<DraftOrderConversionRecord | null> {
    return this.prisma.draft.findFirst({
      where: {
        id: draftId,
        userId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        photoObjectId: true,
        photoFit: true,
        headline: true,
        message: true,
        fieldValues: true,
        scheduledFor: true,
        occurrenceDate: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        template: {
          select: {
            id: true,
            slug: true,
            name: true,
            widthMm: true,
            heightMm: true,
            orientation: true,
            previewLabel: true,
            accentHex: true,
            surfaceHex: true,
            textHex: true,
          },
        },
        renderPreview: {
          select: {
            id: true,
            artifactObjectId: true,
          },
        },
      },
    }) as Promise<DraftOrderConversionRecord | null>;
  }

  create(params: CreateOrderParams): Promise<OrderRecord> {
    return this.prisma.order.create({
      data: {
        ...params,
        fieldValues: params.fieldValues,
      },
      select: orderSelect,
    });
  }

  listOrdersPendingPrintableAssets(
    limit: number,
  ): Promise<PrintableAssetJobRecord[]> {
    return this.prisma.order.findMany({
      where: {
        printableAssetStatus: 'PENDING',
      },
      orderBy: [{ createdAt: 'asc' }],
      take: limit,
      select: {
        id: true,
        userId: true,
        templateSlug: true,
        templateName: true,
        templateWidthMm: true,
        templateHeightMm: true,
        templatePreviewLabel: true,
        templateAccentHex: true,
        templateSurfaceHex: true,
        templateTextHex: true,
        headline: true,
        message: true,
        photoObjectId: true,
        photoFit: true,
      },
    });
  }

  async claimOrderPrintableAsset(orderId: string): Promise<boolean> {
    const result = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        printableAssetStatus: 'PENDING',
      },
      data: {
        printableAssetStatus: 'PROCESSING',
        printableAssetError: null,
      },
    });

    return result.count === 1;
  }

  async markPrintableAssetReady(params: {
    orderId: string;
    printableAssetObjectId: string;
  }): Promise<void> {
    await this.prisma.order.updateMany({
      where: {
        id: params.orderId,
        printableAssetStatus: 'PROCESSING',
      },
      data: {
        printableAssetObjectId: params.printableAssetObjectId,
        printableAssetStatus: 'READY',
        printableAssetGeneratedAt: new Date(),
        printableAssetError: null,
      },
    });
  }

  async markPrintableAssetFailed(params: {
    orderId: string;
    errorMessage: string;
  }): Promise<void> {
    await this.prisma.order.updateMany({
      where: {
        id: params.orderId,
        printableAssetStatus: 'PROCESSING',
      },
      data: {
        printableAssetStatus: 'FAILED',
        printableAssetError: params.errorMessage,
      },
    });
  }
}
