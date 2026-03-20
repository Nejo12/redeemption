import { ColorSwatch } from "@/components/design-system/ColorSwatch";
import { ActionLink } from "@/components/ui/ActionLink";
import { PanelSurface } from "@/components/ui/PanelSurface";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  colorRules,
  colorSwatches,
  componentRoadmap,
  foundationPrinciples,
  tokenGroups,
} from "@/lib/design-system";

export default function DesignSystemDocsPage() {
  return (
    <div className="app-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-10 lg:px-12">
        <PanelSurface className="grid gap-8 overflow-hidden px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone="accent" className="tracking-[0.14em] uppercase">
                Design System Docs
              </StatusPill>
              <span className="text-sm tracking-[0.16em] text-foreground/50 uppercase">
                Web foundation
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                Tokens first, components second, packages only when reuse is real.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-foreground/72 sm:text-lg">
                This page documents the current baseline for product surfaces in the web app. The
                system intentionally starts inside the app layer until multiple consumers justify
                extraction into a shared package.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/">Back to home</ActionLink>
              <ActionLink
                href="https://github.com/Nejo12/redeemption/blob/main/docs/DESIGN_SYSTEM_FOUNDATION.md"
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                Review design spec
              </ActionLink>
            </div>
          </div>

          <PanelSurface className="rounded-[var(--radius-xl)] bg-[linear-gradient(160deg,rgba(255,255,255,0.34),transparent_72%)] p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
              Token groups
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tokenGroups.map((group) => (
                <div
                  key={group}
                  className="rounded-[var(--radius-md)] border border-border bg-surface-strong px-4 py-4 text-sm text-foreground/72"
                >
                  {group}
                </div>
              ))}
            </div>
          </PanelSurface>
        </PanelSurface>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <PanelSurface className="px-6 py-6">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Principles
            </p>
            <div className="mt-4 grid gap-4">
              {foundationPrinciples.map((principle) => (
                <article
                  key={principle.title}
                  className="rounded-[var(--radius-md)] border border-border bg-surface-strong px-5 py-5"
                >
                  <h2 className="text-lg font-semibold text-foreground">{principle.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-foreground/70">{principle.body}</p>
                </article>
              ))}
            </div>
          </PanelSurface>

          <PanelSurface className="px-6 py-6">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Color language
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {colorSwatches.map((swatch) => (
                <ColorSwatch
                  key={swatch.label}
                  label={swatch.label}
                  swatchClassName={swatch.swatchClassName}
                />
              ))}
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-foreground/72">
              {colorRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </PanelSurface>
        </section>

        <PanelSurface className="flex flex-col gap-5 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Extraction roadmap
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground/70">
                These are the primitives already reflected in the seeded homepage and ready for
                broader reuse across future screens.
              </p>
            </div>
            <StatusPill>Ready for shared page primitives</StatusPill>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {componentRoadmap.map((item) => (
              <div
                key={item}
                className="rounded-[var(--radius-md)] border border-border bg-surface-strong px-4 py-4 text-sm font-medium text-foreground/78"
              >
                {item}
              </div>
            ))}
          </div>
        </PanelSurface>
      </main>
    </div>
  );
}
