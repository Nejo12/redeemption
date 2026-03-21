import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { DraftOrderConversionRecord } from './orders.types';

class OrdersRepositoryFake {
  private existingOrder = null as { id: string } | null;
  createdOrderDraftId: string | null = null;
  createdOrderTemplateWidthMm: number | null = null;

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
        widthMm: 148,
        heightMm: 210,
        orientation: 'PORTRAIT' as const,
        previewLabel: 'Birthday Bloom',
        accentHex: '#A54D36',
        surfaceHex: '#F3ECE6',
        textHex: '#2B1F1B',
      },
      renderPreview: {
        id: 'preview_1',
        artifactObjectId: 'artifact_1',
      },
    });
  }

  create(params: { draftId: string; templateWidthMm: number }) {
    this.createdOrderDraftId = params.draftId;
    this.createdOrderTemplateWidthMm = params.templateWidthMm;

    return Promise.resolve({
      id: 'order_1',
      userId: 'user_1',
      draftId: params.draftId,
      contactId: 'contact_1',
      contactFirstName: 'Mira',
      contactLastName: 'Cole',
      templateId: 'template_1',
      templateSlug: 'birthday-bloom',
      templateName: 'Birthday Bloom',
      templateWidthMm: 148,
      templateHeightMm: 210,
      templateOrientation: 'PORTRAIT' as const,
      templatePreviewLabel: 'Birthday Bloom',
      templateAccentHex: '#A54D36',
      templateSurfaceHex: '#F3ECE6',
      templateTextHex: '#2B1F1B',
      renderPreviewId: 'preview_1',
      artifactObjectId: 'artifact_1',
      printableAssetObjectId: null,
      printableAssetStatus: 'PENDING' as const,
      printableAssetGeneratedAt: null,
      printableAssetError: null,
      photoObjectId: 'photo_1',
      status: 'AWAITING_PAYMENT' as const,
      shippingType: null,
      shippingZone: null,
      currency: null,
      subtotalCents: null,
      taxCents: null,
      totalCents: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      paidAt: null,
      lastPaymentError: null,
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

class StorageServiceFake {
  getPrintableAssetUploadPlan() {
    return {
      bucket: 'bucket',
      objectKey: 'object-key',
      originalFilename: 'printable.pdf',
      contentType: 'application/pdf' as const,
    };
  }

  readOwnedPhotoUpload() {
    return Promise.resolve({
      object: {
        contentType: 'image/png',
      },
      body: Buffer.from('photo'),
      contentType: 'image/png',
    });
  }

  registerPrintableAsset() {
    return Promise.resolve({
      object: {
        id: 'printable_1',
      },
    });
  }
}

describe('OrdersService', () => {
  let repository: OrdersRepositoryFake;
  let storageService: StorageServiceFake;
  let service: OrdersService;

  beforeEach(() => {
    repository = new OrdersRepositoryFake();
    storageService = new StorageServiceFake();
    service = new OrdersService(
      repository as unknown as OrdersRepository,
      storageService as unknown as StorageService,
    );
  });

  it('creates an order from an approved draft', async () => {
    const response = await service.createOrderFromDraft('user_1', 'draft_1');

    expect(repository.createdOrderDraftId).toBe('draft_1');
    expect(repository.createdOrderTemplateWidthMm).toBe(148);
    expect(response.order.status).toBe('AWAITING_PAYMENT');
    expect(response.order.artifactObjectId).toBe('artifact_1');
    expect(response.order.printableAssetStatus).toBe('PENDING');
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
