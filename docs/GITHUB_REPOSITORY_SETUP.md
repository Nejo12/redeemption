# GitHub Repository Setup

This document captures the GitHub-side configuration that should be applied alongside the tracked `.github` files in the repository.

## Branch Protection

Configure branch protection for `main` with these minimum rules:

- Require a pull request before merging.
- Require at least 1 approval before merging.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merging.
- Require status checks to pass before merging.
- Require the `CI / verify` job.
- Restrict direct pushes to `main`.
- Allow squash merge.
- Disable merge commits unless the team explicitly decides to use them.

## Environments

Create these GitHub environments:

- `preview`
- `staging`
- `production`

Recommended protection rules:

- `production`
  - require at least one reviewer before deployment
  - allow deployments only from `main`
- `staging`
  - optionally require reviewer approval if the environment is shared
- `preview`
  - keep unblocked for pull request deploys unless the team later needs tighter control

Keep the environment names aligned with [`docs/ENVIRONMENT_STRATEGY.md`](./ENVIRONMENT_STRATEGY.md) and [`docs/CD_SETUP.md`](./CD_SETUP.md).

## Labels

Use these labels as the baseline taxonomy:

- `bug`
- `enhancement`
- `task`
- `epic`
- `backend`
- `frontend`
- `infra`
- `payments`
- `fulfillment`
- `templates`
- `moments`
- `security`
- `compliance`
- `testing`
- `blocked`
- `priority:high`
- `priority:medium`
- `priority:low`

The product-planning labels and phase milestones should stay aligned with [`docs/GITHUB_ISSUES_MVP.md`](./GITHUB_ISSUES_MVP.md).

## Milestones

Create these milestones:

- `phase-0`
- `phase-1`
- `phase-2`
- `phase-3`
- `phase-4`
- `phase-5`
- `phase-6`
- `phase-7`

Use the definitions in [`docs/GITHUB_ISSUES_MVP.md`](./GITHUB_ISSUES_MVP.md) as the source of truth.

## Owners and Reviews

- Keep `CODEOWNERS` in sync with the actual maintainer set.
- If ownership changes, update [`.github/CODEOWNERS`](../.github/CODEOWNERS) in the same pull request.
- Require review from a code owner once the repository has multiple active maintainers.

## Pull Request Hygiene

- Use the repository pull request template.
- Link PRs to issues where possible.
- Keep PRs scoped to one logical change.
- Require `npm run verify` locally before requesting review.

## Node Version

The CI workflow runs on Node.js `22`, and local development should use the same major version. Use [`.nvmrc`](../.nvmrc) to align local shells with CI.
