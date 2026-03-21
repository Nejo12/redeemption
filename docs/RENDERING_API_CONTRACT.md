# Rendering API Contract

`POST /render-previews`

Authenticated endpoint that turns the current template-editor state into a server-rendered HTML preview and persists a render artifact record for the next worker/PDF slice.

## Request

```json
{
  "templateSlug": "soft-light",
  "fieldValues": {
    "headline": "For Mira",
    "message": "A thoughtful note for {first_name}."
  },
  "photoObjectId": "photo_upload_123",
  "photoFit": "COVER"
}
```

Rules:

- `templateSlug` must resolve to an active template.
- `fieldValues` must only contain keys that belong to non-photo template fields.
- Required text fields must be present and non-empty.
- Required photo templates must include a `photoObjectId`.
- `photoObjectId` must belong to the authenticated user and reference a stored `PHOTO_UPLOAD`.
- `photoFit` may be `FIT` or `COVER`.

## Response

```json
{
  "preview": {
    "id": "render_preview_123",
    "templateId": "template_1",
    "templateSlug": "soft-light",
    "templateName": "Soft Light",
    "headline": "For Mira",
    "message": "A thoughtful note for {first_name}.",
    "fieldValues": {
      "headline": "For Mira",
      "message": "A thoughtful note for {first_name}."
    },
    "fieldSummaries": [
      "Headline: For Mira",
      "Message: A thoughtful note for {first_name}.",
      "Photo: 1 uploaded image attached"
    ],
    "photoObjectId": "photo_upload_123",
    "photoFit": "COVER",
    "artifactObjectId": "render_artifact_456",
    "html": "<!DOCTYPE html>...",
    "createdAt": "2026-03-21T10:15:00.000Z",
    "updatedAt": "2026-03-21T10:15:00.000Z"
  }
}
```

Notes:

- The response includes inline HTML so the web editor can display the server preview immediately.
- The same HTML is also written to object storage as a `RENDER_ARTIFACT`.
- The preview artifact remains approval-focused and editable.
- Immutable order PDFs are generated later from the order snapshot, not by mutating this preview artifact in place.
