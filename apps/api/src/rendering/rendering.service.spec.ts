import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RenderingService } from './rendering.service';
import { RenderingRepository } from './rendering.repository';
import { TemplatesRepository } from '../templates/templates.repository';
import { StorageService } from '../storage/storage.service';
import { TemplateRecord } from '../templates/templates.types';

class RenderingRepositoryFake {
  createPreview(params: Parameters<RenderingRepository['createPreview']>[0]) {
    return Promise.resolve({
      id: params.id,
      photoObjectId: params.photoObjectId,
      artifactObjectId: params.artifactObjectId,
      headline: params.headline,
      message: params.message,
      fieldValues: params.fieldValues,
      photoFit: params.photoFit,
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
    });
  }
}

class TemplatesRepositoryFake {
  template: TemplateRecord | null = {
    id: 'template_1',
    slug: 'soft-light',
    name: 'Soft Light',
    category: 'GENERAL',
    summary: 'Warm editorial layout',
    description: 'A template for thoughtful messages.',
    widthMm: 127,
    heightMm: 177,
    orientation: 'PORTRAIT',
    previewLabel: 'Design System Seed',
    previewHeadline: 'A calmer foundation',
    previewMessage: 'A thoughtful message appears here.',
    accentHex: '#d88a6f',
    surfaceHex: '#f7f1eb',
    textHex: '#2b1f1b',
    isActive: true,
    createdAt: new Date('2026-03-20T00:00:00.000Z'),
    updatedAt: new Date('2026-03-20T00:00:00.000Z'),
    fields: [
      {
        key: 'headline',
        label: 'Headline',
        kind: 'TEXT',
        required: true,
        placeholder: 'Headline',
        maxLength: 80,
        position: 1,
      },
      {
        key: 'message',
        label: 'Message',
        kind: 'TEXTAREA',
        required: true,
        placeholder: 'Message',
        maxLength: 400,
        position: 2,
      },
      {
        key: 'photo',
        label: 'Photo',
        kind: 'PHOTO',
        required: true,
        placeholder: null,
        maxLength: null,
        position: 3,
      },
    ],
  };

  findBySlug(slug: string) {
    if (this.template?.slug === slug) {
      return Promise.resolve(this.template);
    }

    return Promise.resolve(null);
  }
}

class StorageServiceFake {
  assertOwnedPhotoUploadCalls = 0;
  readOwnedPhotoUploadCalls = 0;
  createRenderArtifactCalls = 0;

  assertOwnedPhotoUpload() {
    this.assertOwnedPhotoUploadCalls += 1;
    return Promise.resolve({
      id: 'photo_1',
      userId: 'user_1',
      kind: 'PHOTO_UPLOAD' as const,
      bucket: 'moments-dev',
      objectKey: 'uploads/users/user_1/photos/photo_1.jpg',
      originalFilename: 'cover.jpg',
      contentType: 'image/jpeg',
      sizeBytes: 1024,
      checksumSha256: 'abc123',
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
    });
  }

  readOwnedPhotoUpload() {
    this.readOwnedPhotoUploadCalls += 1;
    return Promise.resolve({
      object: {
        id: 'photo_1',
        userId: 'user_1',
        kind: 'PHOTO_UPLOAD' as const,
        bucket: 'moments-dev',
        objectKey: 'uploads/users/user_1/photos/photo_1.jpg',
        originalFilename: 'cover.jpg',
        contentType: 'image/jpeg',
        sizeBytes: 1024,
        checksumSha256: 'abc123',
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
        updatedAt: new Date('2026-03-21T00:00:00.000Z'),
      },
      body: Buffer.from('photo-body'),
      contentType: 'image/jpeg',
    });
  }

  createRenderArtifact(
    params: Parameters<StorageService['createRenderArtifact']>[0],
  ) {
    this.createRenderArtifactCalls += 1;
    return Promise.resolve({
      object: {
        id: params.artifactId,
        kind: 'RENDER_ARTIFACT' as const,
        originalFilename: `${params.templateSlug}-preview.html`,
        contentType: 'text/html; charset=utf-8',
        sizeBytes: params.html.length,
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
        updatedAt: new Date('2026-03-21T00:00:00.000Z'),
      },
    });
  }
}

describe('RenderingService', () => {
  let templatesRepository: TemplatesRepositoryFake;
  let storageService: StorageServiceFake;
  let renderingService: RenderingService;

  beforeEach(() => {
    templatesRepository = new TemplatesRepositoryFake();
    storageService = new StorageServiceFake();
    renderingService = new RenderingService(
      new RenderingRepositoryFake() as unknown as RenderingRepository,
      templatesRepository as unknown as TemplatesRepository,
      storageService as unknown as StorageService,
    );
  });

  it('creates a server preview and persists a render artifact', async () => {
    const response = await renderingService.createPreview('user_1', {
      templateSlug: 'soft-light',
      fieldValues: {
        headline: 'For Mira',
        message: 'A note for someone thoughtful.',
      },
      photoObjectId: 'photo_1',
      photoFit: 'COVER',
    });

    expect(response.preview.templateSlug).toBe('soft-light');
    expect(response.preview.photoFit).toBe('COVER');
    expect(response.preview.html).toContain('For Mira');
    expect(storageService.createRenderArtifactCalls).toBe(1);
  });

  it('rejects missing required text fields', async () => {
    await expect(
      renderingService.createPreview('user_1', {
        templateSlug: 'soft-light',
        fieldValues: {
          headline: '',
          message: 'A note for someone thoughtful.',
        },
        photoObjectId: 'photo_1',
        photoFit: 'FIT',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing photos for templates that require one', async () => {
    await expect(
      renderingService.createPreview('user_1', {
        templateSlug: 'soft-light',
        fieldValues: {
          headline: 'For Mira',
          message: 'A note for someone thoughtful.',
        },
        photoObjectId: null,
        photoFit: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fails when the template does not exist', async () => {
    await expect(
      renderingService.createPreview('user_1', {
        templateSlug: 'missing-template',
        fieldValues: {},
        photoObjectId: null,
        photoFit: null,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
