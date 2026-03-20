# Addresses API Contract

This document captures the initial authenticated address-book contract for the MVP.

## Scope

- authenticated CRUD for user-owned addresses
- basic required-field validation
- validation state tracking without an external postal validator yet

This slice intentionally stops before linking addresses to contacts. That next step can now focus on primary and alternate address ownership rather than reworking the address schema itself.

## Routes

### `GET /addresses`

Returns the current user's addresses.

Optional query:

- `q`: text search across line 1, city, region, postal code, and country code

Response:

```json
{
  "addresses": [
    {
      "id": "address_123",
      "line1": "12 Orchard Row",
      "line2": null,
      "city": "Berlin",
      "region": "Berlin",
      "postalCode": "10115",
      "countryCode": "DE",
      "validationStatus": "VALID",
      "createdAt": "2026-03-20T00:00:00.000Z",
      "updatedAt": "2026-03-20T00:00:00.000Z"
    }
  ]
}
```

### `POST /addresses`

Creates an address for the current user.

Body:

```json
{
  "line1": "48 Market Street",
  "line2": "Apartment 6B",
  "city": "Dublin",
  "region": "Leinster",
  "postalCode": "D02",
  "countryCode": "IE"
}
```

Response:

```json
{
  "address": {
    "id": "address_123",
    "line1": "48 Market Street",
    "line2": "Apartment 6B",
    "city": "Dublin",
    "region": "Leinster",
    "postalCode": "D02",
    "countryCode": "IE",
    "validationStatus": "VALID",
    "createdAt": "2026-03-20T00:00:00.000Z",
    "updatedAt": "2026-03-20T00:00:00.000Z"
  }
}
```

### `PATCH /addresses/:addressId`

Updates an existing address owned by the current user.

### `DELETE /addresses/:addressId`

Deletes an existing address owned by the current user.

Response:

```json
{
  "deleted": true
}
```

## Validation Rules

- `line1` is required
- `city` is required
- `postalCode` is required
- `countryCode` is required and must be a two-letter ISO country code
- `line2` and `region` are optional

## Validation Status

Current behavior:

- addresses that pass the current required-field validation are stored as `VALID`

Future behavior:

- postal-provider verification can later promote or demote the status without changing the core CRUD contract
