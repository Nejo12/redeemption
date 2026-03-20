import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RenderPhotoFit } from '@prisma/client';
import { randomUUID } from 'crypto';
import { StorageService } from '../storage/storage.service';
import { TemplatesRepository } from '../templates/templates.repository';
import { TemplateRecord } from '../templates/templates.types';
import {
  CreateRenderPreviewRequestBody,
  RenderPhotoFitValue,
  RenderPreviewFieldValues,
  RenderPreviewResponse,
  RenderPreviewView,
} from './rendering.contract';
import {
  buildRenderPreviewContent,
  buildRenderPreviewHtml,
} from './rendering-html';
import { RenderingRepository } from './rendering.repository';
import {
  RenderPreviewRecord,
  toRenderPreviewJsonObject,
} from './rendering.types';

@Injectable()
export class RenderingService {
  constructor(
    private readonly renderingRepository: RenderingRepository,
    private readonly templatesRepository: TemplatesRepository,
    private readonly storageService: StorageService,
  ) {}

  async createPreview(
    userId: string,
    body: CreateRenderPreviewRequestBody,
  ): Promise<RenderPreviewResponse> {
    const template = await this.templatesRepository.findBySlug(
      body.templateSlug,
    );
    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    const fieldValues = this.normalizeFieldValues(template, body.fieldValues);
    const photoObjectId = await this.resolvePhotoObjectId(
      userId,
      template,
      body.photoObjectId,
    );
    const photoFit = photoObjectId ? (body.photoFit ?? 'FIT') : null;
    const photoFile = photoObjectId
      ? await this.storageService.readOwnedPhotoUpload(userId, photoObjectId)
      : null;
    const previewContent = buildRenderPreviewContent(
      template,
      fieldValues,
      Boolean(photoObjectId),
    );
    const previewId = randomUUID();
    const artifactId = randomUUID();
    const html = buildRenderPreviewHtml({
      template,
      content: previewContent,
      photoDataUrl: photoFile
        ? this.buildDataUrl(
            photoFile.contentType ?? photoFile.object.contentType,
            photoFile.body,
          )
        : null,
      photoFit,
    });
    const artifact = await this.storageService.createRenderArtifact({
      artifactId,
      userId,
      previewId,
      templateSlug: template.slug,
      html,
    });
    const preview = await this.renderingRepository.createPreview({
      id: previewId,
      userId,
      templateId: template.id,
      photoObjectId,
      artifactObjectId: artifact.object.id,
      headline: previewContent.headline,
      message: previewContent.message,
      fieldValues: toRenderPreviewJsonObject(fieldValues),
      photoFit: this.toRenderPhotoFit(photoFit),
    });

    return {
      preview: this.toRenderPreviewView(
        preview,
        template,
        fieldValues,
        previewContent.fieldSummaries,
        html,
      ),
    };
  }

  private normalizeFieldValues(
    template: TemplateRecord,
    input: RenderPreviewFieldValues,
  ): RenderPreviewFieldValues {
    const supportedFields = template.fields.filter(
      (field) => field.kind !== 'PHOTO',
    );
    const supportedFieldKeys = new Set(
      supportedFields.map((field) => field.key),
    );

    for (const providedKey of Object.keys(input)) {
      if (!supportedFieldKeys.has(providedKey)) {
        throw new BadRequestException(
          `Field "${providedKey}" is not valid for template "${template.slug}".`,
        );
      }
    }

    const normalizedValues: RenderPreviewFieldValues = {};

    for (const field of supportedFields) {
      const value = input[field.key] ?? '';
      if (field.maxLength && value.length > field.maxLength) {
        throw new BadRequestException(
          `${field.label} must be ${field.maxLength} characters or fewer.`,
        );
      }

      if (field.required && !value.trim()) {
        throw new BadRequestException(`${field.label} is required.`);
      }

      normalizedValues[field.key] = value;
    }

    return normalizedValues;
  }

  private async resolvePhotoObjectId(
    userId: string,
    template: TemplateRecord,
    photoObjectId: string | null,
  ): Promise<string | null> {
    const requiresPhoto = template.fields.some(
      (field) => field.kind === 'PHOTO' && field.required,
    );

    if (!photoObjectId) {
      if (requiresPhoto) {
        throw new BadRequestException(
          'This template requires one uploaded photo before rendering.',
        );
      }

      return null;
    }

    await this.storageService.assertOwnedPhotoUpload(userId, photoObjectId);
    return photoObjectId;
  }

  private buildDataUrl(contentType: string, fileBuffer: Buffer): string {
    return `data:${contentType};base64,${fileBuffer.toString('base64')}`;
  }

  private toRenderPhotoFit(
    photoFit: RenderPhotoFitValue | null,
  ): RenderPhotoFit | null {
    return photoFit;
  }

  private toRenderPreviewView(
    preview: RenderPreviewRecord,
    template: TemplateRecord,
    fieldValues: RenderPreviewFieldValues,
    fieldSummaries: string[],
    html: string,
  ): RenderPreviewView {
    return {
      id: preview.id,
      templateId: template.id,
      templateSlug: template.slug,
      templateName: template.name,
      headline: preview.headline,
      message: preview.message,
      fieldValues,
      fieldSummaries,
      photoObjectId: preview.photoObjectId,
      photoFit: preview.photoFit,
      artifactObjectId: preview.artifactObjectId,
      html,
      createdAt: preview.createdAt.toISOString(),
      updatedAt: preview.updatedAt.toISOString(),
    };
  }
}
