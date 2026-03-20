# Contacts API Contract

This document defines the first protected contacts boundary for the product.

## Goals

- keep contacts as a separate domain module from auth and sender onboarding
- support authenticated CRUD with a typed contract the web app can consume directly
- make duplicate detection visible without making it blocking

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
  "createdAt": "2026-03-20T00:00:00.000Z",
  "updatedAt": "2026-03-20T00:00:00.000Z"
}
```

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

- addresses are not part of this module yet
- no CSV import yet
- no external contact sources yet
- duplicate detection is intentionally simple for the first slice
