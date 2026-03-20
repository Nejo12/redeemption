# CD Setup

This document defines the repository-side deployment automation that now exists, along with the GitHub and provider configuration still required outside the repo.

## Tracked Workflows

- [`deploy-web.yml`](../.github/workflows/deploy-web.yml)
- [`deploy-services.yml`](../.github/workflows/deploy-services.yml)

## Deployment Model

- `web`
  - preview deploys on pull requests that touch the web app
  - production deploys on pushes to `main`
  - manual preview or production deploys are also available through `workflow_dispatch`
- `api`
  - staging deploys are manual through `workflow_dispatch`
  - production deploys trigger on pushes to `main`
- `worker`
  - staging deploys are manual through `workflow_dispatch`
  - production deploys trigger on pushes to `main`

This matches the current baseline in [`DEPLOYMENT_PLAN.md`](./DEPLOYMENT_PLAN.md): preview automation for the web app, controlled staging deploys, and production deploys from protected `main`.

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

Create separate services for:

- `api`
- `worker`

Create them in both:

- `staging`
- `production`

For each Railway service:

1. connect the repository
2. configure the service root directory
3. add runtime variables from [`ENVIRONMENT_STRATEGY.md`](./ENVIRONMENT_STRATEGY.md)
4. generate a deploy hook URL
5. store that deploy hook URL in the matching GitHub secret

## Workflow Behavior

### `deploy-web`

- Runs on pull requests and on pushes to `main`.
- Preview deploys require Vercel secrets to be present.
- Production deploys require Vercel secrets to be present.
- If secrets are missing, the deploy job is skipped rather than failing unrelated pushes.

### `deploy-services`

- Runs on pushes to `main` for production service deploys.
- Supports manual staging or production deploys through `workflow_dispatch`.
- Uses Railway deploy hooks so GitHub does not need long-lived runtime credentials for the services.
- If the relevant deploy hook secret is missing, that job is skipped.

## Rollout Checklist

1. Create the GitHub environments.
2. Add all Vercel and Railway GitHub secrets.
3. Create the Vercel web project rooted at `apps/web`.
4. Create Railway `api` and `worker` services for `staging` and `production`.
5. Add runtime variables on Vercel and Railway.
6. Run the `deploy-web` workflow manually in `preview` mode to verify Vercel linkage.
7. Run the `deploy-services` workflow manually for `staging` to verify Railway deploy hooks.
8. After verification, allow protected `main` to drive production deploys.

## Required User Actions

These workflows are now committed in-repo, but you still need to complete the external setup:

1. create the GitHub environments
2. add the listed GitHub secrets
3. create and configure the Vercel and Railway projects
4. add runtime environment variables in those providers
5. run the first manual staging and preview deploys to validate the provider links
