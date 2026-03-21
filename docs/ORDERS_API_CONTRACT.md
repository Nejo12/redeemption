# Orders API Contract

Authenticated endpoints for listing order-ready records and converting approved drafts into orders.

## `GET /orders`

Returns the current user's order records in reverse chronological order.

Behavior:

- orders are immutable snapshots derived from approved drafts
- each order stores its own contact/template summary fields
- each order carries an immutable render artifact object reference

## `POST /orders/from-drafts/:draftId`

Converts one approved draft into an order record.

Behavior:

- only drafts in `APPROVED` status can be converted
- a draft can be converted only once
- the approved draft must already have a persisted render preview
- the created order starts in `AWAITING_PAYMENT`
- the order stores immutable references for:
  - `renderPreviewId`
  - `artifactObjectId`
  - optional `photoObjectId`
