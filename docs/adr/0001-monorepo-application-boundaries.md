# ADR 0001: Monorepo Application Boundaries

## Status

Accepted

## Context

The repository contains a Next.js web app, a NestJS API, and a BullMQ-based worker. The project needs clear ownership boundaries early so product logic does not become duplicated across apps as implementation grows.

## Decision

The monorepo will keep three primary runtime applications with these boundaries:

- `apps/web` owns browser UI and user interaction flows.
- `apps/api` owns backend orchestration, persistence, and external integration entrypoints.
- `apps/worker` owns asynchronous queue-driven background processing.

The API remains the primary business boundary. The worker handles asynchronous execution, but it does not become a parallel product-facing service boundary.

## Consequences

Positive:

- clearer ownership for future features
- fewer accidental cross-app dependencies
- easier reasoning about where business logic belongs

Negative:

- some reuse opportunities will stay duplicated temporarily until shared-package extraction is justified
- background workflows require explicit queue and persistence boundaries instead of informal in-process shortcuts
