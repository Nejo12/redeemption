import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { buildPrintableAssetHtml } from '../rendering/rendering-html';
import { StorageService } from '../storage/storage.service';
import {
  ClaimPrintableAssetsResponse,
  CompletePrintableAssetRequestBody,
  FailPrintableAssetRequestBody,
  OrderListResponse,
  OrderResponse,
  OrderView,
  PrintableAssetJobView,
} from './orders.contract';
import { OrdersRepository } from './orders.repository';
import {
  DraftOrderConversionRecord,
  OrderRecord,
  PrintableAssetJobRecord,
} from './orders.types';

const defaultPrintableAssetBatchSize = 10;

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly storageService: StorageService,
  ) {}

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
      templateWidthMm: draft.template.widthMm,
      templateHeightMm: draft.template.heightMm,
      templateOrientation: draft.template.orientation,
      templatePreviewLabel: draft.template.previewLabel,
      templateAccentHex: draft.template.accentHex,
      templateSurfaceHex: draft.template.surfaceHex,
      templateTextHex: draft.template.textHex,
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

  async claimPrintableAssets(
    limit = defaultPrintableAssetBatchSize,
  ): Promise<ClaimPrintableAssetsResponse> {
    const candidates =
      await this.ordersRepository.listOrdersPendingPrintableAssets(limit);
    const jobs: PrintableAssetJobView[] = [];

    for (const order of candidates) {
      const claimed = await this.ordersRepository.claimOrderPrintableAsset(
        order.id,
      );
      if (!claimed) {
        continue;
      }

      try {
        jobs.push(await this.toPrintableAssetJobView(order));
      } catch (error) {
        await this.ordersRepository.markPrintableAssetFailed({
          orderId: order.id,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Printable asset job preparation failed.',
        });
      }
    }

    return {
      claimedOrders: jobs.length,
      jobs,
    };
  }

  async completePrintableAsset(
    orderId: string,
    body: CompletePrintableAssetRequestBody,
  ): Promise<{ completed: true }> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.printableAssetStatus !== 'PROCESSING') {
      throw new BadRequestException(
        'Printable asset completion is only valid for processing orders.',
      );
    }

    await this.storageService.registerPrintableAsset({
      objectId: body.assetObjectId,
      userId: order.userId,
      orderId,
      templateSlug: order.templateSlug,
      sizeBytes: body.sizeBytes,
      checksumSha256: body.checksumSha256,
    });
    await this.ordersRepository.markPrintableAssetReady({
      orderId,
      printableAssetObjectId: body.assetObjectId,
    });

    return { completed: true };
  }

  async failPrintableAsset(
    orderId: string,
    body: FailPrintableAssetRequestBody,
  ): Promise<{ failed: true }> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.printableAssetStatus !== 'PROCESSING') {
      throw new BadRequestException(
        'Printable asset failure is only valid for processing orders.',
      );
    }

    await this.ordersRepository.markPrintableAssetFailed({
      orderId,
      errorMessage: body.errorMessage,
    });

    return { failed: true };
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
    const printableAssetGeneratedAt =
      order.printableAssetGeneratedAt instanceof Date
        ? order.printableAssetGeneratedAt.toISOString()
        : null;

    return {
      id: order.id,
      draftId: order.draftId,
      contactId: order.contactId,
      contactFirstName: order.contactFirstName,
      contactLastName: order.contactLastName,
      templateId: order.templateId,
      templateSlug: order.templateSlug,
      templateName: order.templateName,
      templateWidthMm: order.templateWidthMm,
      templateHeightMm: order.templateHeightMm,
      templateOrientation: order.templateOrientation,
      templatePreviewLabel: order.templatePreviewLabel,
      templateAccentHex: order.templateAccentHex,
      templateSurfaceHex: order.templateSurfaceHex,
      templateTextHex: order.templateTextHex,
      renderPreviewId: order.renderPreviewId,
      artifactObjectId: order.artifactObjectId,
      printableAssetObjectId: order.printableAssetObjectId,
      printableAssetStatus: order.printableAssetStatus,
      printableAssetGeneratedAt,
      printableAssetError: order.printableAssetError,
      photoObjectId: order.photoObjectId,
      status: order.status,
      shippingType: order.shippingType,
      shippingZone: order.shippingZone,
      currency: order.currency,
      subtotalCents: order.subtotalCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,
      stripeCheckoutSessionId: order.stripeCheckoutSessionId,
      stripePaymentIntentId: order.stripePaymentIntentId,
      paidAt: order.paidAt?.toISOString() ?? null,
      lastPaymentError: order.lastPaymentError,
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

  private async toPrintableAssetJobView(
    order: PrintableAssetJobRecord,
  ): Promise<PrintableAssetJobView> {
    const assetObjectId = randomUUID();
    const uploadPlan = this.storageService.getPrintableAssetUploadPlan(
      order.userId,
      order.id,
      order.templateSlug,
    );
    const photoFile = order.photoObjectId
      ? await this.storageService.readOwnedPhotoUpload(
          order.userId,
          order.photoObjectId,
        )
      : null;

    return {
      orderId: order.id,
      assetObjectId,
      bucket: uploadPlan.bucket,
      objectKey: uploadPlan.objectKey,
      originalFilename: uploadPlan.originalFilename,
      contentType: uploadPlan.contentType,
      widthMm: order.templateWidthMm,
      heightMm: order.templateHeightMm,
      html: buildPrintableAssetHtml({
        template: {
          name: order.templateName,
          previewLabel: order.templatePreviewLabel,
          widthMm: order.templateWidthMm,
          heightMm: order.templateHeightMm,
          accentHex: order.templateAccentHex,
          surfaceHex: order.templateSurfaceHex,
          textHex: order.templateTextHex,
        },
        headline: order.headline,
        message: order.message,
        photoDataUrl: photoFile
          ? this.buildDataUrl(
              photoFile.contentType ?? photoFile.object.contentType,
              photoFile.body,
            )
          : null,
        photoFit: order.photoFit,
      }),
    };
  }

  private buildDataUrl(contentType: string, fileBuffer: Buffer): string {
    return `data:${contentType};base64,${fileBuffer.toString('base64')}`;
  }
}
