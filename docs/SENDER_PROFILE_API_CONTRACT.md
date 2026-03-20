# Sender Profile API Contract

This document defines the first onboarding contract for sender identity and return-address readiness.

## Goals

- keep sender onboarding out of the auth module while still relying on the auth session
- give the web app a stable route for profile persistence and readiness checks
- make the future checkout gate explicit before checkout exists

## Routes

### `GET /sender-profile`

Returns the current sender profile plus checkout readiness.

Headers:

```http
Authorization: Bearer <access-token>
```

Response:

- `profile`
- `readiness`

### `PUT /sender-profile`

Creates or updates the current sender profile for the authenticated user.

Request body:

```json
{
  "fullName": "Jordan Example",
  "addressLine1": "12 Example Street",
  "addressLine2": "Apt 4",
  "city": "Berlin",
  "region": "Berlin",
  "postalCode": "10115",
  "countryCode": "DE",
  "preferredLocale": "en-US",
  "preferredCurrency": "EUR"
}
```

Response:

- `profile`
- `readiness`

## Readiness Rules

The current sender profile is considered ready for checkout only when all of these fields exist:

- `fullName`
- `addressLine1`
- `city`
- `region`
- `postalCode`
- `countryCode`
- `preferredLocale`
- `preferredCurrency`

The response includes:

- `isReadyForCheckout`
- `missingFields`

## Current Limitations

- only one sender profile exists per account
- no multi-sender support
- no external address validation provider yet
- no checkout route consumes this gate yet, but the readiness rule is already explicit
