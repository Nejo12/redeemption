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

Returns the current user's scheduled, ready-for-review, approved, and skipped drafts.

Behavior:

- the API reports persisted draft state only; it does not materialize due drafts during read requests
- a background worker claims due drafts, renders previews, and transitions them from `SCHEDULED` to `READY_FOR_REVIEW`

## `PATCH /drafts/:draftId`

Updates one review-ready draft and regenerates its render preview safely.

Behavior:

- only drafts in `READY_FOR_REVIEW` can be edited
- the request uses template field values plus optional `photoObjectId` and `photoFit`
- a successful edit keeps the draft in `READY_FOR_REVIEW` and replaces its preview reference

## `POST /drafts/:draftId/approve`

Approves one review-ready draft.

Behavior:

- transitions the current draft to `APPROVED`
- advances recurring moment rules to their next occurrence
- seeds the next scheduled draft for recurring rules

## `POST /drafts/:draftId/skip`

Skips one review-ready draft.

Behavior:

- transitions the current draft to `SKIPPED`
- advances recurring moment rules to their next occurrence
- seeds the next scheduled draft for recurring rules

## `POST /drafts/:draftId/snooze`

Snoozes one review-ready draft back into the scheduled queue.

Behavior:

- transitions the current draft from `READY_FOR_REVIEW` back to `SCHEDULED`
- clears the existing preview reference so the background worker re-materializes it later
- requires a future `draftReadyAt` that is earlier than the send date

## `POST /internal/drafts/materialize-due`

Internal worker-only endpoint for claiming and materializing due drafts in batches.

Behavior:

- requires the `x-internal-worker-token` header
- claims only drafts still in `SCHEDULED` status
- transitions claimed drafts to `PROCESSING` while rendering is underway
- returns batch counts for claimed, processed, and failed drafts

## `DELETE /moments/:momentId`

Deletes the moment rule and its dependent drafts.
