# Contacts API Contract

This document defines the first protected contacts boundary for the product.

## Goals

- keep contacts as a separate domain module from auth and sender onboarding
- support authenticated CRUD with a typed contract the web app can consume directly
- make duplicate detection visible without making it blocking
- connect contacts to a primary address plus optional alternate addresses

## Routes

All routes require:

```http
Authorization: Bearer <access-token>
```

### `GET /contacts`

Returns the authenticated user's contacts.

Optional query:

- `q`: search against first name, last name, and notes

### `POST /contacts`

Creates a contact.

### `PATCH /contacts/:contactId`

Updates a contact owned by the authenticated user.

### `DELETE /contacts/:contactId`

Deletes a contact owned by the authenticated user.

## Contact Shape

```json
{
  "id": "contact_123",
  "firstName": "Jordan",
  "lastName": "Example",
  "relationshipTag": "FRIEND",
  "birthday": "1991-04-16",
  "timezone": "Europe/Berlin",
  "notes": "College friend",
  "primaryAddress": {
    "id": "address_123",
    "line1": "12 Orchard Row",
    "line2": null,
    "city": "Berlin",
    "region": "Berlin",
    "postalCode": "10115",
    "countryCode": "DE",
    "validationStatus": "VALID"
  },
  "alternateAddresses": [],
  "createdAt": "2026-03-20T00:00:00.000Z",
  "updatedAt": "2026-03-20T00:00:00.000Z"
}
```

## Address Assignment

Create and update payloads may include:

- `primaryAddressId`
- `alternateAddressIds`

Rules:

- assigned addresses must belong to the authenticated user
- `primaryAddressId` cannot also appear in `alternateAddressIds`
- contacts may exist without any assigned address

## Duplicate Warning

Create and update responses may include a non-blocking warning:

- `duplicateContactIds`
- `message`

Current heuristic:

- same first name
- same last name
- same authenticated user

This warning does not block save. It only surfaces a likely duplicate for review.

## Current Limitations

- address ownership is still managed through the separate address book
- no CSV import yet
- no external contact sources yet
- duplicate detection is intentionally simple for the first slice
