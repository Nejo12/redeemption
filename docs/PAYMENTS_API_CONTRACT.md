## Payments API Contract

Authenticated checkout-session creation plus Stripe webhook handling.

## `POST /orders/:orderId/checkout-session`

Creates a hosted Stripe Checkout Session for one unpaid order.

Request body:

```json
{
  "shippingType": "STANDARD"
}
```

Behavior:

- recalculates pricing from the current order + sender profile + contact primary address
- persists the current pricing snapshot onto the order before redirecting
- returns a hosted `checkoutUrl`
- rejects paid orders or orders that are not currently unpaid
- rejects checkout until the order has `printableAssetStatus = READY`

Response shape:

- `orderId`
- `checkoutSessionId`
- `checkoutUrl`
- `expiresAt`

## `POST /payments/stripe/webhook`

Handles Stripe webhook events as the payment source of truth.

Current MVP events:

- `checkout.session.completed` -> mark order `PAID`
- `checkout.session.expired` -> mark order `PAYMENT_FAILED`
- `payment_intent.payment_failed` -> mark order `PAYMENT_FAILED`

Webhook notes:

- raw request body is required for Stripe signature verification
- events are deduplicated by Stripe event id before order state changes are applied
