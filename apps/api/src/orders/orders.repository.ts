import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateOrderParams,
  DraftOrderConversionRecord,
  OrderRecord,
} from './orders.types';

const orderSelect = {
  id: true,
  draftId: true,
  contactId: true,
  contactFirstName: true,
  contactLastName: true,
  templateId: true,
  templateSlug: true,
  templateName: true,
  renderPreviewId: true,
  artifactObjectId: true,
  photoObjectId: true,
  status: true,
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
}
