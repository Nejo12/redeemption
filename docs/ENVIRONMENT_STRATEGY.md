# Environment Strategy

This document defines the environment contract for local development, CI, preview, staging, and production.

## Goals

- Keep local development deterministic.
- Avoid hidden required environment variables.
- Separate public variables from server-only secrets.
- Keep CI reproducible without production secrets.
- Make staging and production configuration explicit before CD is added.

## Environment Names

Use these environment names consistently across GitHub, hosting providers, and documentation:

- `local`
- `ci`
- `preview`
- `staging`
- `production`

## Source Of Truth

- Root [`.env.example`](../.env.example) is a shared local reference for infrastructure and local URLs.
- Each runtime app keeps its own `.env.example` file:
  - [`apps/web/.env.example`](../apps/web/.env.example)
  - [`apps/api/.env.example`](../apps/api/.env.example)
  - [`apps/worker/.env.example`](../apps/worker/.env.example)
- Real secrets must never be committed.
- CI should use GitHub Actions secrets and variables.
- Preview, staging, and production should use the target hosting platform's secret management.

## File Policy

- Commit `*.env.example` files.
- Do not commit `.env`, `.env.local`, `.env.preview`, `.env.staging`, or `.env.production`.
- Add a new variable to the relevant `*.env.example` file in the same pull request that introduces code depending on it.
- Remove variables from the example files when they are no longer used.

## Public Vs Server-Only Variables

Only the web app may expose browser-safe variables, and they must use the `NEXT_PUBLIC_` prefix.

- Public:
  - `NEXT_PUBLIC_API_URL`
- Server-only:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `JWT_SECRET`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`

## Environment Matrix

### Shared local development reference

| Variable               | Local         | CI     | Preview      | Staging      | Production   | Notes                                    |
| ---------------------- | ------------- | ------ | ------------ | ------------ | ------------ | ---------------------------------------- |
| `NODE_ENV`             | `development` | `test` | `production` | `production` | `production` | Runtime mode                             |
| `WEB_APP_URL`          | Required      | No     | Optional     | Required     | Required     | Shared local reference only              |
| `API_BASE_URL`         | Required      | No     | Optional     | Required     | Required     | Shared local reference only              |
| `REDIS_URL`            | Required      | No     | Required     | Required     | Required     | Queue backing service                    |
| `S3_ENDPOINT`          | Required      | No     | Required     | Required     | Required     | Local MinIO, remote object storage later |
| `S3_BUCKET`            | Required      | No     | Required     | Required     | Required     | Artifact bucket                          |
| `S3_ACCESS_KEY_ID`     | Required      | No     | Required     | Required     | Required     | Secret outside local examples            |
| `S3_SECRET_ACCESS_KEY` | Required      | No     | Required     | Required     | Required     | Secret outside local examples            |

### Web app

| Variable              | Local    | CI  | Preview  | Staging  | Production | Notes                     |
| --------------------- | -------- | --- | -------- | -------- | ---------- | ------------------------- |
| `NEXT_PUBLIC_API_URL` | Required | No  | Required | Required | Required   | Browser-safe API base URL |

### API app

| Variable                | Local        | CI  | Preview      | Staging                     | Production                  | Notes                      |
| ----------------------- | ------------ | --- | ------------ | --------------------------- | --------------------------- | -------------------------- |
| `PORT`                  | Required     | No  | Required     | Required                    | Required                    | Defaults to `3001` locally |
| `APP_BASE_URL`          | Required     | No  | Required     | Required                    | Required                    | Current local web origin   |
| `DATABASE_URL`          | Required     | No  | Required     | Required                    | Required                    | Server-only                |
| `REDIS_URL`             | Required     | No  | Required     | Required                    | Required                    | Server-only                |
| `S3_ENDPOINT`           | Required     | No  | Required     | Required                    | Required                    | Server-only                |
| `S3_BUCKET`             | Required     | No  | Required     | Required                    | Required                    | Server-only                |
| `S3_ACCESS_KEY_ID`      | Required     | No  | Required     | Required                    | Required                    | Secret                     |
| `S3_SECRET_ACCESS_KEY`  | Required     | No  | Required     | Required                    | Required                    | Secret                     |
| `STRIPE_SECRET_KEY`     | Optional now | No  | Optional now | Required when payments ship | Required when payments ship | Secret                     |
| `STRIPE_WEBHOOK_SECRET` | Optional now | No  | Optional now | Required when payments ship | Required when payments ship | Secret                     |
| `JWT_SECRET`            | Required     | No  | Required     | Required                    | Required                    | Secret                     |
| `EMAIL_FROM`            | Required     | No  | Required     | Required                    | Required                    | Sender identity            |

### Worker app

| Variable               | Local    | CI  | Preview  | Staging  | Production | Notes         |
| ---------------------- | -------- | --- | -------- | -------- | ---------- | ------------- |
| `REDIS_URL`            | Required | No  | Required | Required | Required   | Server-only   |
| `S3_ENDPOINT`          | Required | No  | Required | Required | Required   | Server-only   |
| `S3_BUCKET`            | Required | No  | Required | Required | Required   | Server-only   |
| `S3_ACCESS_KEY_ID`     | Required | No  | Required | Required | Required   | Secret        |
| `S3_SECRET_ACCESS_KEY` | Required | No  | Required | Required | Required   | Secret        |
| `RENDER_TIMEOUT_MS`    | Optional | No  | Optional | Optional | Optional   | Worker tuning |

## CI Policy

The current CI workflow runs repository verification only and should not require deployment secrets.

- CI must stay green with no production credentials present.
- If a future test requires external services, add explicit service containers or mocks rather than depending on hosted secrets by default.

## Local Development Policy

- Use `npm run infra:up` to start Redis and MinIO locally.
- Use `npm run dev` for web + API.
- Use `npm run dev:worker` only when infrastructure is available.
- Use `npm run dev:full` to run infrastructure and all app processes together.

## Change Management

When adding or changing a variable:

1. Update the relevant `*.env.example` file.
2. Update this document if the environment matrix changes.
3. Update deployment/provider secrets before enabling code paths that depend on the variable.
4. Mention the environment impact in the pull request.
