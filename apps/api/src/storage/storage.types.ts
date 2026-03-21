import { StoredObject, StoredObjectKind } from '@prisma/client';

export type StoredObjectRecord = Pick<
  StoredObject,
  | 'id'
  | 'kind'
  | 'originalFilename'
  | 'contentType'
  | 'sizeBytes'
  | 'createdAt'
  | 'updatedAt'
>;

export type CreateStoredObjectParams = Pick<
  StoredObject,
  | 'id'
  | 'userId'
  | 'kind'
  | 'bucket'
  | 'objectKey'
  | 'originalFilename'
  | 'contentType'
  | 'sizeBytes'
  | 'checksumSha256'
>;

export type UploadedBinaryFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export type UploadObjectParams = {
  bucket: string;
  objectKey: string;
  body: Buffer;
  contentType: string;
};

export type StoredObjectDetailsRecord = Pick<
  StoredObject,
  | 'id'
  | 'userId'
  | 'kind'
  | 'bucket'
  | 'objectKey'
  | 'originalFilename'
  | 'contentType'
  | 'sizeBytes'
  | 'checksumSha256'
  | 'createdAt'
  | 'updatedAt'
>;

export type CreateStoredAssetParams = {
  objectId: string;
  userId: string;
  templateSlug: string;
  parentId: string;
  originalFilename: string;
  body: Buffer;
  contentType: string;
  kind: StoredObjectKind;
};

export type DownloadObjectParams = {
  bucket: string;
  objectKey: string;
};

export type DownloadedObject = {
  body: Buffer;
  contentType: string | null;
};

export type StoredObjectKindValue = StoredObjectKind;
