# Orders API Contract

Authenticated endpoints for listing order-ready records and converting approved drafts into orders.

## `GET /orders`

Returns the current user's order records in reverse chronological order.

Behavior:

- orders are immutable snapshots derived from approved drafts
- each order stores its own contact/template summary fields
- each order carries:
  - the original preview artifact reference used during approval
  - a separate printable asset lifecycle for the order-safe PDF
- printable asset generation is handled asynchronously by the worker
- checkout should only proceed once `printableAssetStatus` is `READY`

## `POST /orders/from-drafts/:draftId`

Converts one approved draft into an order record.

Behavior:

- only drafts in `APPROVED` status can be converted
- a draft can be converted only once
- the approved draft must already have a persisted render preview
- the created order starts in `AWAITING_PAYMENT`
- the order stores immutable references and render metadata for:
  - `renderPreviewId`
  - `artifactObjectId`
  - optional `photoObjectId`
  - template size/orientation/color snapshot fields used to generate the final PDF
- the order starts with `printableAssetStatus = PENDING`
