import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { DraftOrderConversionRecord } from './orders.types';

class OrdersRepositoryFake {
  private existingOrder = null as { id: string } | null;
  createdOrderDraftId: string | null = null;

  listOrdersByUserId() {
    return Promise.resolve([]);
  }

  findByDraftId() {
    return Promise.resolve(this.existingOrder);
  }

  findDraftForConversion(): Promise<DraftOrderConversionRecord | null> {
    return Promise.resolve({
      id: 'draft_1',
      userId: 'user_1',
      status: 'APPROVED' as const,
      photoObjectId: 'photo_1',
      photoFit: 'FIT' as const,
      headline: 'Mira Cole',
      message: 'Happy birthday, Mira.',
      fieldValues: {
        recipient_name: 'Mira Cole',
        message_body: 'Happy birthday, Mira.',
      },
      scheduledFor: new Date('2099-04-16T00:00:00.000Z'),
      occurrenceDate: new Date('2099-04-16T00:00:00.000Z'),
      contact: {
        id: 'contact_1',
        firstName: 'Mira',
        lastName: 'Cole',
      },
      template: {
        id: 'template_1',
        slug: 'birthday-bloom',
        name: 'Birthday Bloom',
      },
      renderPreview: {
        id: 'preview_1',
        artifactObjectId: 'artifact_1',
      },
    });
  }

  create(params: { draftId: string }) {
    this.createdOrderDraftId = params.draftId;

    return Promise.resolve({
      id: 'order_1',
      draftId: params.draftId,
      contactId: 'contact_1',
      contactFirstName: 'Mira',
      contactLastName: 'Cole',
      templateId: 'template_1',
      templateSlug: 'birthday-bloom',
      templateName: 'Birthday Bloom',
      renderPreviewId: 'preview_1',
      artifactObjectId: 'artifact_1',
      photoObjectId: 'photo_1',
      status: 'AWAITING_PAYMENT' as const,
      headline: 'Mira Cole',
      message: 'Happy birthday, Mira.',
      fieldValues: {
        recipient_name: 'Mira Cole',
        message_body: 'Happy birthday, Mira.',
      },
      photoFit: 'FIT' as const,
      scheduledFor: new Date('2099-04-16T00:00:00.000Z'),
      occurrenceDate: new Date('2099-04-16T00:00:00.000Z'),
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
    });
  }

  setExistingOrder() {
    this.existingOrder = {
      id: 'order_existing',
    };
  }
}

describe('OrdersService', () => {
  let repository: OrdersRepositoryFake;
  let service: OrdersService;

  beforeEach(() => {
    repository = new OrdersRepositoryFake();
    service = new OrdersService(repository as unknown as OrdersRepository);
  });

  it('creates an order from an approved draft', async () => {
    const response = await service.createOrderFromDraft('user_1', 'draft_1');

    expect(repository.createdOrderDraftId).toBe('draft_1');
    expect(response.order.status).toBe('AWAITING_PAYMENT');
    expect(response.order.artifactObjectId).toBe('artifact_1');
  });

  it('rejects duplicate order creation for the same draft', async () => {
    repository.setExistingOrder();

    await expect(
      service.createOrderFromDraft('user_1', 'draft_1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects conversion when the approved draft cannot be found', async () => {
    repository.findDraftForConversion = () => Promise.resolve(null);

    await expect(
      service.createOrderFromDraft('user_1', 'draft_missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
