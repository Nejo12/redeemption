import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateRenderPreviewParams,
  RenderPreviewRecord,
} from './rendering.types';

@Injectable()
export class RenderingRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPreview(
    params: CreateRenderPreviewParams,
  ): Promise<RenderPreviewRecord> {
    return this.prisma.renderPreview.create({
      data: params,
      select: {
        id: true,
        photoObjectId: true,
        artifactObjectId: true,
        headline: true,
        message: true,
        fieldValues: true,
        photoFit: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
