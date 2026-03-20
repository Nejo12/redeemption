# ADR 0002: Shared Package Extraction Policy

## Status

Accepted

## Context

The workspace is configured for `packages/*`, but there are no shared packages yet. Creating shared packages too early would add indirection before reuse patterns are stable.

## Decision

The repository will not introduce shared packages until reuse is real and stable. Shared code should remain in its owning app until all of the following conditions are true:

1. The code is used by more than one app.
2. The shared behavior is stable enough to support a maintained interface.
3. Extracting it reduces duplication without obscuring ownership.

## Consequences

Positive:

- simpler early-stage code organization
- lower maintenance overhead
- clearer ownership during rapid iteration

Negative:

- some duplication may exist temporarily
- extra refactoring will be required later when shared modules become justified
