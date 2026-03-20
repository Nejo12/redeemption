import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateStoredObjectParams,
  StoredObjectDetailsRecord,
  StoredObjectRecord,
} from './storage.types';

@Injectable()
export class StorageRepository {
  constructor(private readonly prisma: PrismaService) {}

  createStoredObject(
    params: CreateStoredObjectParams,
  ): Promise<StoredObjectRecord> {
    return this.prisma.storedObject.create({
      data: params,
      select: {
        id: true,
        kind: true,
        originalFilename: true,
        contentType: true,
        sizeBytes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findPhotoUploadsByUserId(userId: string): Promise<StoredObjectRecord[]> {
    return this.prisma.storedObject.findMany({
      where: {
        userId,
        kind: 'PHOTO_UPLOAD',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        kind: true,
        originalFilename: true,
        contentType: true,
        sizeBytes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findOwnedStoredObjectById(
    userId: string,
    objectId: string,
  ): Promise<StoredObjectDetailsRecord | null> {
    return this.prisma.storedObject.findFirst({
      where: {
        id: objectId,
        userId,
      },
      select: {
        id: true,
        userId: true,
        kind: true,
        bucket: true,
        objectKey: true,
        originalFilename: true,
        contentType: true,
        sizeBytes: true,
        checksumSha256: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
