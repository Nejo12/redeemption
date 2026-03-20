import {
  RenderPhotoFitValue,
  RenderPreviewFieldValues,
} from './rendering.contract';
import {
  TemplateFieldRecord,
  TemplateRecord,
} from '../templates/templates.types';

type RenderPreviewContent = {
  headline: string;
  message: string;
  fieldSummaries: string[];
};

type BuildRenderPreviewHtmlParams = {
  template: TemplateRecord;
  content: RenderPreviewContent;
  photoDataUrl: string | null;
  photoFit: RenderPhotoFitValue | null;
};

export function buildRenderPreviewContent(
  template: TemplateRecord,
  fieldValues: RenderPreviewFieldValues,
  hasPhoto: boolean,
): RenderPreviewContent {
  return {
    headline: getPreviewHeadline(template, fieldValues),
    message: getPreviewMessage(template, fieldValues),
    fieldSummaries: template.fields.map((field) =>
      buildFieldSummary(field, fieldValues[field.key] ?? '', hasPhoto),
    ),
  };
}

export function buildRenderPreviewHtml(
  params: BuildRenderPreviewHtmlParams,
): string {
  const objectFit = params.photoFit === 'COVER' ? 'cover' : 'contain';
  const accent = escapeHtml(params.template.accentHex);
  const surface = escapeHtml(params.template.surfaceHex);
  const text = escapeHtml(params.template.textHex);
  const headline = escapeHtml(params.content.headline);
  const message = escapeHtml(params.content.message).replace(/\n/g, '<br />');
  const fieldSummaries = params.content.fieldSummaries
    .map((summary) => `<li>${escapeHtml(summary)}</li>`)
    .join('');
  const photoMarkup = params.photoDataUrl
    ? `<img src="${params.photoDataUrl}" alt="Uploaded preview asset" style="width: 100%; height: 100%; object-fit: ${objectFit};" />`
    : '<div style="display:flex;height:100%;align-items:center;justify-content:center;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(43,31,27,0.55);">Awaiting photo upload</div>';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(params.template.name)} preview</title>
  </head>
  <body style="margin:0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3ece6;color:${text};">
    <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px;">
      <section style="width:min(100%,920px);border-radius:32px;background:${surface};border:1px solid rgba(43,31,27,0.08);box-shadow:0 22px 64px rgba(43,31,27,0.14);padding:32px;">
        <div style="display:grid;gap:24px;grid-template-columns:1.08fr 0.92fr;">
          <div style="display:flex;flex-direction:column;gap:16px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${accent};">${escapeHtml(params.template.previewLabel)}</p>
            <h1 style="margin:0;font-size:44px;line-height:0.95;letter-spacing:-0.05em;">${headline}</h1>
            <p style="margin:0;font-size:17px;line-height:1.8;color:rgba(43,31,27,0.76);">${message}</p>
            <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;line-height:1.8;color:rgba(43,31,27,0.72);">
              ${fieldSummaries}
            </ul>
          </div>
          <div style="display:grid;gap:16px;">
            <div style="min-height:320px;overflow:hidden;border-radius:24px;background:rgba(255,255,255,0.65);border:1px solid rgba(43,31,27,0.08);">
              ${photoMarkup}
            </div>
            <div style="display:grid;gap:12px;grid-template-columns:repeat(3,minmax(0,1fr));">
              <div style="border-radius:18px;background:rgba(255,255,255,0.58);border:1px solid rgba(43,31,27,0.08);padding:14px;">
                <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(43,31,27,0.5);">Accent</p>
                <div style="margin-top:12px;height:44px;border-radius:14px;background:${accent};"></div>
              </div>
              <div style="border-radius:18px;background:rgba(255,255,255,0.58);border:1px solid rgba(43,31,27,0.08);padding:14px;">
                <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(43,31,27,0.5);">Surface</p>
                <div style="margin-top:12px;height:44px;border-radius:14px;background:${surface};border:1px solid rgba(43,31,27,0.08);"></div>
              </div>
              <div style="border-radius:18px;background:rgba(255,255,255,0.58);border:1px solid rgba(43,31,27,0.08);padding:14px;">
                <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(43,31,27,0.5);">Text</p>
                <div style="margin-top:12px;height:44px;border-radius:14px;background:${text};"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

function getPreviewHeadline(
  template: TemplateRecord,
  fieldValues: RenderPreviewFieldValues,
): string {
  const firstTextField = template.fields.find((field) => field.kind === 'TEXT');
  if (firstTextField) {
    const value = fieldValues[firstTextField.key]?.trim();
    if (value) {
      return value;
    }
  }

  return template.previewHeadline;
}

function getPreviewMessage(
  template: TemplateRecord,
  fieldValues: RenderPreviewFieldValues,
): string {
  const firstTextareaField = template.fields.find(
    (field) => field.kind === 'TEXTAREA',
  );
  if (firstTextareaField) {
    const value = fieldValues[firstTextareaField.key]?.trim();
    if (value) {
      return value;
    }
  }

  return template.previewMessage;
}

function buildFieldSummary(
  field: TemplateFieldRecord,
  value: string,
  hasPhoto: boolean,
): string {
  if (field.kind === 'PHOTO') {
    return hasPhoto
      ? `${field.label}: 1 uploaded image attached`
      : `${field.label}: waiting for upload`;
  }

  const trimmedValue = value.trim();
  if (trimmedValue) {
    return `${field.label}: ${trimmedValue}`;
  }

  return `${field.label}${field.required ? ' (required)' : ' (optional)'}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
