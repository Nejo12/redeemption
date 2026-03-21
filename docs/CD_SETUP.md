# CD Setup

This document defines the repository-side deployment automation that now exists, along with the GitHub and provider configuration still required outside the repo.

## Tracked Workflows

- [`deploy-web.yml`](../.github/workflows/deploy-web.yml)
- [`deploy-services.yml`](../.github/workflows/deploy-services.yml)

## Deployment Model

- `web`
  - Vercel native Git deployment is the production source of truth
  - preview deployments come from Vercel, not from GitHub Actions
  - manual preview or production deploys are available through `workflow_dispatch` as a fallback
- `api`
  - Railway native Git deployment is the production source of truth
  - staging or production deploys are available through `workflow_dispatch` as a fallback
- `worker`
  - Railway native Git deployment is the production source of truth
  - staging or production deploys are available through `workflow_dispatch` as a fallback
  - the worker currently owns due-draft materialization polling and printable PDF generation for orders

This matches the current baseline in [`DEPLOYMENT_PLAN.md`](./DEPLOYMENT_PLAN.md): provider-native Git deployment is the default path, and GitHub Actions remains an explicit fallback when you need to force a deploy from the repository side.

## Required GitHub Secrets

Add these repository or environment secrets before expecting the workflows to execute actual deployments.

### Vercel

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_WEB`

### Railway

- `RAILWAY_DEPLOY_HOOK_URL_API_STAGING`
- `RAILWAY_DEPLOY_HOOK_URL_WORKER_STAGING`
- `RAILWAY_DEPLOY_HOOK_URL_API_PRODUCTION`
- `RAILWAY_DEPLOY_HOOK_URL_WORKER_PRODUCTION`

## Recommended GitHub Environments

Create these GitHub environments so environment-scoped secrets and approvals remain explicit:

- `preview`
- `staging`
- `production`

Recommended protection:

- `production`
  - require at least one reviewer before deployment
  - restrict deployment branches to `main`
- `staging`
  - optionally require reviewers if staging is shared
- `preview`
  - no reviewer requirement by default

## Provider Setup

### Vercel

Configure one Vercel project for the web app with:

- root directory: `apps/web`
- production branch: `main`
- preview deployments enabled
- environment variables set for:
  - `NEXT_PUBLIC_API_URL`

Generate the Vercel token from a maintainer account, then capture the project and org IDs from the linked project metadata.

### Railway

Create separate services or resources for:

- `api`
- `worker`
- `Postgres`
- `Redis`
- object storage bucket

Create them in both:

- `staging`
- `production`

For each Railway service:

1. connect the repository
2. configure the service root directory
3. add runtime variables from [`ENVIRONMENT_STRATEGY.md`](./ENVIRONMENT_STRATEGY.md)
4. configure service commands:
   - `api`
     - build: `npm -w api run build`
     - start: `npm -w api run start:prod`
   - `worker`
     - build: `npm -w worker run build`
     - start: `npm -w worker run start`
5. align shared runtime variables:
   - `api`
     - `APP_BASE_URL`
     - `INTERNAL_WORKER_TOKEN`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
   - `worker`
     - `API_BASE_URL`
     - `INTERNAL_WORKER_TOKEN`
     - `DRAFT_SCHEDULER_INTERVAL_MS`
6. generate a deploy hook URL if you want to use the manual fallback workflows
7. store that deploy hook URL in the matching GitHub secret

## Workflow Behavior

### `deploy-web`

- Runs only through `workflow_dispatch`.
- Validates required Vercel secrets before trying to deploy.
- Exists as a manual fallback when you need to force a deploy outside Vercel's native Git integration.

### `deploy-services`

- Supports manual staging or production deploys through `workflow_dispatch`.
- Uses Railway deploy hooks so GitHub does not need long-lived runtime credentials for the services.
- Validates the relevant deploy-hook secret before trying to deploy.

## Rollout Checklist

1. Create the GitHub environments.
2. Add all Vercel and Railway GitHub secrets.
3. Create the Vercel web project rooted at `apps/web`.
4. Create Railway `api` and `worker` services for `staging` and `production`.
5. Add runtime variables on Vercel and Railway.
6. Run the `deploy-web` workflow manually in `preview` mode to verify Vercel linkage.
7. Run the `deploy-services` workflow manually for `staging` to verify Railway deploy hooks.
8. Keep provider-native Git deployment enabled so normal pushes do not depend on GitHub fallback workflows.

## Required User Actions

These workflows are now committed in-repo, but you still need to complete the external setup:

1. create the GitHub environments
2. add the listed GitHub secrets
3. create and configure the Vercel and Railway projects
4. add runtime environment variables in those providers
5. run the first manual staging and preview deploys to validate the provider links
