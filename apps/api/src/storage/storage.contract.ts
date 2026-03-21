export type StoredObjectKindValue =
  | 'PHOTO_UPLOAD'
  | 'RENDER_ARTIFACT'
  | 'PRINTABLE_ASSET';

export interface StoredObjectView {
  id: string;
  kind: StoredObjectKindValue;
  originalFilename: string | null;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredObjectResponse {
  object: StoredObjectView;
}

export interface StoredObjectListResponse {
  objects: StoredObjectView[];
}
