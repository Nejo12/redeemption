# Contributing Guide

## Development Workflow

Before concluding any task, review the `scripts` section in the root [`package.json`](./package.json) and in each affected workspace package. Use the existing scripts first, and prefer reusing the packages, components, and utilities already present in the codebase before introducing new dependencies or duplicate abstractions.

Run the smallest relevant checks while iterating, then run `npm run verify` before declaring implementation complete.

## Engineering Standards

Write code that is readable, maintainable, and efficient. Favor clear names, small focused modules, consistent formatting, and changes that reduce duplication instead of spreading similar logic across the codebase.

Use DRY and SOLID as practical decision rules:

- Keep each module focused on one responsibility.
- Extend existing abstractions when they fit instead of branching unrelated behavior into them.
- Preserve substitutability when introducing interfaces or shared contracts.
- Keep interfaces narrow and task-oriented.
- Depend on stable abstractions rather than concrete implementation details when the design needs to scale.

## Type Safety

- Do not use `any`.
- Do not leave unused variables, imports, or parameters unless they are intentionally prefixed with `_`.
- Prefer explicit domain types when they improve clarity, and rely on inference when the inferred type is already precise and readable.

## Comments

Comments should explain intent, constraints, or non-obvious behavior, not restate the code.

- Use `//` for short implementation notes.
- Use `/* ... */` for longer local explanations when a compact comment is not enough.
- Use `/** ... */` for exported APIs, contracts, and behavior that needs durable documentation.

## Reuse First

Before creating a new component, helper, service, or package:

1. Check the current workspace packages and application code for an existing implementation you can reuse or extend.
2. Prefer adapting the current codebase structure to keep behavior consistent.
3. Add new packages only when the requirement cannot be met cleanly with what already exists.

## Completion Checklist

Before marking work complete:

1. Review the relevant `package.json` scripts in the root package and the affected workspace package.
2. Run the relevant package-level checks while implementing.
3. Run `npm run verify` for a full repository validation pass when the change is ready.
4. Confirm that the change is typed correctly, lint-clean, and does not leave dead code behind.
