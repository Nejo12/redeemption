# Templates API Contract

This document defines the first template-catalog boundary for the product.

## Goals

- store template metadata through Prisma and committed migration history
- seed a small MVP catalog across birthday, general, holiday, thank-you, and anniversary use cases
- expose a lightweight preview contract the web app can browse before editor and rendering work land

## Routes

### `GET /templates`

Returns the active template catalog.

Supported query params:

- `q`: optional case-insensitive search across template name, summary, and description
- `category`: optional category filter

Allowed category values:

- `BIRTHDAY`
- `GENERAL`
- `HOLIDAY`
- `THANK_YOU`
- `ANNIVERSARY`

Response shape:

```json
{
  "templates": [
    {
      "id": "template_birthday_bloom",
      "slug": "birthday-bloom",
      "name": "Birthday Bloom",
      "category": "BIRTHDAY",
      "summary": "A floral portrait card with room for a warm birthday note.",
      "description": "Built for milestone birthdays and intimate celebrations with a soft portrait layout and a single photo slot.",
      "widthMm": 127,
      "heightMm": 177,
      "orientation": "PORTRAIT",
      "previewLabel": "Birthday / Portrait",
      "previewHeadline": "Send a birthday note that feels quietly personal.",
      "previewMessage": "Soft florals, one hero photo, and a generous writing area keep this template intimate instead of overly busy.",
      "accentHex": "#E38B6D",
      "surfaceHex": "#F8EDE5",
      "textHex": "#2F211D",
      "isActive": true,
      "fields": [
        {
          "key": "recipient_name",
          "label": "Recipient name",
          "kind": "TEXT",
          "required": true,
          "placeholder": "Amina",
          "maxLength": 40,
          "position": 1
        }
      ],
      "createdAt": "2026-03-20T00:00:00.000Z",
      "updatedAt": "2026-03-20T00:00:00.000Z"
    }
  ],
  "availableCategories": ["BIRTHDAY", "GENERAL", "HOLIDAY", "THANK_YOU", "ANNIVERSARY"]
}
```

### `GET /templates/:templateSlug`

Returns one active template by slug.

## Current Limitations

- templates are seeded directly through migration history for now
- template versioning is not implemented yet
- field metadata is browse-ready but not yet bound to a live editor
- preview rendering is intentionally lightweight and not print-accurate yet
