# Moments API Contract

Authenticated endpoints for saving moment rules and surfacing the next draft queue.

## `GET /moments`

Returns the current user's saved moment rules plus the next linked draft, if one exists.

## `POST /moments`

Creates one moment rule, computes the next occurrence, and persists the next draft snapshot.

### Request

```json
{
  "name": "Mira birthday",
  "contactId": "contact_123",
  "templateId": "template_birthday_bloom",
  "eventType": "CONTACT_BIRTHDAY",
  "oneOffDate": null,
  "leadTimeDays": 7,
  "deliveryPreference": "ARRIVE_BY",
  "approvalMode": "ALWAYS_ASK",
  "messageTemplate": "Happy {occasion}, {first_name}. From {sender_name}.",
  "photoObjectId": "photo_upload_123",
  "photoFit": "FIT"
}
```

Rules:

- `eventType` supports `CONTACT_BIRTHDAY` and `ONE_OFF_DATE`.
- `CONTACT_BIRTHDAY` requires the selected contact to already have a birthday.
- `ONE_OFF_DATE` requires a future or same-day `oneOffDate` in `YYYY-MM-DD` format.
- `leadTimeDays` must be between `0` and `60`.
- `photoObjectId`, when present, must belong to the authenticated user.
- message tokens currently supported in `messageTemplate`:
  - `{first_name}`
  - `{sender_name}`
  - `{occasion}`

## `GET /drafts`

Returns the current user's scheduled and ready-for-review drafts.

Behavior:

- if a scheduled draft is already due, the API materializes its render preview before responding
- due drafts transition from `SCHEDULED` to `READY_FOR_REVIEW`

## `DELETE /moments/:momentId`

Deletes the moment rule and its dependent drafts.
