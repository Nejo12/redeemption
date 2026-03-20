# Design System Foundation

This document defines the initial design-system baseline for the project.

## Goals

- Create a consistent visual language before the web app grows.
- Keep tokens centralized and reusable.
- Prefer composition over one-off styling.
- Make future shared UI packages easier to extract.

## Visual Direction

- Tone: editorial, warm, and deliberate rather than generic SaaS.
- Color system: paper-inspired neutrals with a strong ink color and a warm accent.
- Layout: generous spacing, strong typography hierarchy, restrained card system.
- Motion: minimal and meaningful. No decorative animation by default.

## Token Groups

The first token groups live in [`apps/web/src/app/globals.css`](../apps/web/src/app/globals.css):

- color
- typography
- spacing
- radius
- shadow
- surface treatment

These tokens should remain the source of truth until a shared UI package is extracted.

## Typography Rules

- Use the sans stack for product UI and marketing copy.
- Use the mono stack only for identifiers, code-like labels, or system metadata.
- Prefer strong size and weight changes over arbitrary color changes for hierarchy.

## Color Rules

- Use semantic tokens rather than raw hex values in component code.
- Reserve the accent color for actions, emphasis, and highlights.
- Keep destructive or status colors out of the system until the actual flows require them.

## Component Rules

- Build components from tokens first, not from ad hoc utility clusters.
- Reuse surface, border, and spacing conventions across cards and sections.
- Keep interaction styles consistent between buttons, links, and panels.

## Initial Component Baseline

The first web page establishes the baseline primitives:

- page shell
- hero
- feature cards
- status strip
- primary and secondary actions

## Next Steps

1. Extract repeated page primitives into shared components under `apps/web/src/components`.
2. Add a token reference page or Storybook once more UI is present.
3. Introduce status and feedback tokens when real product flows require them.
4. Move shared primitives into a package only after multiple apps consume them.
