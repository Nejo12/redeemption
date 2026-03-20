import { Prisma, RenderPhotoFit, RenderPreview } from '@prisma/client';

export type RenderPreviewRecord = Pick<
  RenderPreview,
  | 'id'
  | 'photoObjectId'
  | 'artifactObjectId'
  | 'headline'
  | 'message'
  | 'fieldValues'
  | 'photoFit'
  | 'createdAt'
  | 'updatedAt'
>;

export type CreateRenderPreviewParams = {
  id: string;
  userId: string;
  templateId: string;
  photoObjectId: string | null;
  artifactObjectId: string;
  headline: string;
  message: string;
  fieldValues: Prisma.InputJsonObject;
  photoFit: RenderPhotoFit | null;
};

export function toRenderPreviewJsonObject(
  fieldValues: Record<string, string>,
): Prisma.InputJsonObject {
  return Object.fromEntries(
    Object.entries(fieldValues),
  ) as Prisma.InputJsonObject;
}
