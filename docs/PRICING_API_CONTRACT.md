## Pricing API Contract

Authenticated pricing quotes for unpaid orders before checkout exists.

## `GET /orders/:orderId/pricing?shippingType=STANDARD|PRIORITY`

Returns a current itemized quote for one unpaid order.

Current MVP rules:

- destination is derived from the contact's current primary address
- sender country and currency are derived from the sender profile
- only `EUR`, `USD`, and `GBP` are supported for MVP pricing
- taxes use the sender-country baseline strategy, not a full tax provider
- pricing is only available while the order is unpaid

Response shape:

- `pricing.orderId`
- `pricing.currency`
- `pricing.format`
- `pricing.shippingType`
- `pricing.shippingZone`
- `pricing.destinationCountryCode`
- `pricing.senderCountryCode`
- `pricing.taxRateBps`
- `pricing.taxStrategy`
- `pricing.lineItems[]`
- `pricing.subtotalCents`
- `pricing.taxCents`
- `pricing.totalCents`
- `pricing.generatedAt`

Errors:

- `400` when the sender profile is not checkout-ready
- `400` when the contact has no valid primary address
- `400` when the order is already paid or otherwise no longer unpaid
- `404` when the order cannot be found
