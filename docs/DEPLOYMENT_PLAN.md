# Deployment Plan

This document defines the recommended deployment baseline for the current monorepo.

The repository now includes baseline deployment workflows for the documented targets. See [`CD_SETUP.md`](./CD_SETUP.md) for the exact GitHub Actions files, required secrets, and provider-side setup checklist.

## Recommended Baseline

- `web`: Vercel
- `api`: Railway
- `worker`: Railway
- `database`: managed Postgres (Railway Postgres or Neon)
- `redis`: managed Redis (Railway Redis or Upstash)
- `object storage`: S3-compatible bucket (AWS S3 or Cloudflare R2)

## Why This Baseline

- Vercel is the strongest default for a Next.js web app with preview deployments.
- Railway keeps API and worker deployment simple with shared environment management.
- Managed Postgres and Redis remove the need to self-host stateful services early.
- S3-compatible storage aligns with the current rendering and artifact model.

## Target Topology

### Web

- Deploy from `main` to production.
- Use preview deployments for pull requests.
- Set `NEXT_PUBLIC_API_URL` per environment.

### API

- Deploy as a long-running service.
- Expose a stable base URL for the web app and external webhooks.
- Attach Postgres, Redis, and object storage credentials through provider secrets.

### Worker

- Deploy as a separate long-running service.
- Share Redis and object storage configuration with the API.
- Do not couple worker rollout to web deploys.

## Environment Mapping

| Environment  | Web                                            | API                                        | Worker                       | Notes                                    |
| ------------ | ---------------------------------------------- | ------------------------------------------ | ---------------------------- | ---------------------------------------- |
| `local`      | local Next dev server                          | local Nest dev server                      | local worker process         | Backed by Docker Compose Redis and MinIO |
| `ci`         | no deploy                                      | no deploy                                  | no deploy                    | Verification only                        |
| `preview`    | Vercel preview                                 | optional shared preview API or staging API | no preview worker by default | Keep preview cost and complexity low     |
| `staging`    | Vercel staging project or protected branch env | Railway staging service                    | Railway staging worker       | Mirrors production integrations          |
| `production` | Vercel production                              | Railway production service                 | Railway production worker    | Stable customer traffic                  |

## Baseline CD Sequence

When deployment automation is added, use this order:

1. Build and verify on every pull request.
2. Deploy preview web builds automatically on pull requests.
3. Deploy staging from a controlled branch or manual workflow.
4. Deploy production from `main` after protected checks pass.
5. Deploy worker independently from web when needed, but using the same tagged release or commit SHA.

## Secrets Ownership

### GitHub

Keep only CI-level or deployment-trigger secrets in GitHub Actions.

Examples:

- provider tokens used to trigger deploys
- optional non-runtime automation keys

Do not make GitHub the primary runtime secret store when the deployment platform already provides one.

### Hosting Providers

Store runtime secrets in the hosting platform for the service that uses them.

- Vercel:
  - `NEXT_PUBLIC_API_URL`
- Railway API:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `S3_ENDPOINT`
  - `S3_BUCKET`
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `JWT_SECRET`
  - `EMAIL_FROM`
- Railway Worker:
  - `REDIS_URL`
  - `S3_ENDPOINT`
  - `S3_BUCKET`
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`
  - `RENDER_TIMEOUT_MS`

## Rollout Priorities

1. Finalize the environment variable contract.
2. Choose the production providers listed above or approve an alternative.
3. Configure staging and production secrets in the hosting platforms.
4. Keep deployment workflows aligned with the selected providers and environment model.

## Required User Actions

The repository now contains the baseline CD workflows, but these external actions still require you:

1. Confirm whether the recommended hosting baseline is acceptable.
2. Create the actual provider accounts and projects.
3. Provision managed Postgres, Redis, and object storage for non-local environments.
4. Add the runtime secrets to the selected hosting platforms.
5. Decide whether preview deployments should share a staging API or use a separate preview API strategy.

Those decisions are prerequisites for the CD setup step, but not for the current repository documentation step.
