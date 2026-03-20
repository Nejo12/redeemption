export type RenderPhotoFitValue = 'FIT' | 'COVER';

export type RenderPreviewFieldValues = Record<string, string>;

export interface CreateRenderPreviewRequestBody {
  templateSlug: string;
  fieldValues: RenderPreviewFieldValues;
  photoObjectId: string | null;
  photoFit: RenderPhotoFitValue | null;
}

export interface RenderPreviewView {
  id: string;
  templateId: string;
  templateSlug: string;
  templateName: string;
  headline: string;
  message: string;
  fieldValues: RenderPreviewFieldValues;
  fieldSummaries: string[];
  photoObjectId: string | null;
  photoFit: RenderPhotoFitValue | null;
  artifactObjectId: string;
  html: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenderPreviewResponse {
  preview: RenderPreviewView;
}
