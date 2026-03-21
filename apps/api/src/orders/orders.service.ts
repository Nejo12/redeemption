import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderListResponse, OrderResponse, OrderView } from './orders.contract';
import { OrdersRepository } from './orders.repository';
import { DraftOrderConversionRecord, OrderRecord } from './orders.types';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async listOrders(userId: string): Promise<OrderListResponse> {
    const orders = await this.ordersRepository.listOrdersByUserId(userId);

    return {
      orders: orders.map((order) => this.toOrderView(order)),
    };
  }

  async createOrderFromDraft(
    userId: string,
    draftId: string,
  ): Promise<OrderResponse> {
    const existingOrder = await this.ordersRepository.findByDraftId(
      userId,
      draftId,
    );
    if (existingOrder) {
      throw new BadRequestException('An order already exists for this draft.');
    }

    const draft = await this.ordersRepository.findDraftForConversion(
      userId,
      draftId,
    );
    if (!draft) {
      throw new NotFoundException('Approved draft not found.');
    }

    this.assertDraftConvertible(draft);

    const order = await this.ordersRepository.create({
      userId,
      draftId: draft.id,
      contactId: draft.contact.id,
      contactFirstName: draft.contact.firstName,
      contactLastName: draft.contact.lastName,
      templateId: draft.template.id,
      templateSlug: draft.template.slug,
      templateName: draft.template.name,
      renderPreviewId: draft.renderPreview!.id,
      artifactObjectId: draft.renderPreview!.artifactObjectId,
      photoObjectId: draft.photoObjectId,
      status: 'AWAITING_PAYMENT',
      headline: draft.headline,
      message: draft.message,
      fieldValues: draft.fieldValues,
      photoFit: draft.photoFit,
      scheduledFor: draft.scheduledFor,
      occurrenceDate: draft.occurrenceDate,
    });

    return {
      order: this.toOrderView(order),
    };
  }

  private assertDraftConvertible(draft: DraftOrderConversionRecord): void {
    if (draft.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved drafts can be converted into orders.',
      );
    }

    if (!draft.renderPreview) {
      throw new BadRequestException(
        'Approved draft must have a render preview before conversion.',
      );
    }
  }

  private toOrderView(order: OrderRecord): OrderView {
    return {
      id: order.id,
      draftId: order.draftId,
      contactId: order.contactId,
      contactFirstName: order.contactFirstName,
      contactLastName: order.contactLastName,
      templateId: order.templateId,
      templateSlug: order.templateSlug,
      templateName: order.templateName,
      renderPreviewId: order.renderPreviewId,
      artifactObjectId: order.artifactObjectId,
      photoObjectId: order.photoObjectId,
      status: order.status,
      headline: order.headline,
      message: order.message,
      fieldValues: order.fieldValues as Record<string, string>,
      photoFit: order.photoFit,
      scheduledFor: order.scheduledFor.toISOString(),
      occurrenceDate: order.occurrenceDate.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
