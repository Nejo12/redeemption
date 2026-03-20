import { ColorSwatch } from "@/components/design-system/ColorSwatch";
import { ActionLink } from "@/components/ui/ActionLink";
import { PanelSurface } from "@/components/ui/PanelSurface";
import { StatusPill } from "@/components/ui/StatusPill";
import { colorRules, colorSwatches, foundationPrinciples } from "@/lib/design-system";

export default function Home() {
  return (
    <div className="app-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
        <PanelSurface className="accent-ring grid gap-10 overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 text-sm tracking-[0.18em] text-accent uppercase">
              <StatusPill tone="accent" className="px-3 py-1 text-sm font-semibold">
                Design System Seed
              </StatusPill>
              <span className="text-foreground/55">Moments to Mail</span>
            </div>

            <div className="flex max-w-3xl flex-col gap-5">
              <h1 className="text-5xl leading-[0.95] font-semibold tracking-[-0.05em] text-foreground sm:text-6xl lg:text-7xl">
                A calmer foundation for thoughtful product surfaces.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-foreground/70 sm:text-xl">
                The design system starts with warm editorial tokens, consistent panel surfaces, and
                a deliberate action language so future product screens do not drift into one-off
                styling.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/auth/signup">Create account</ActionLink>
              <ActionLink href="/auth/login" variant="secondary">
                Sign in
              </ActionLink>
              <ActionLink href="/templates" variant="secondary">
                Browse templates
              </ActionLink>
            </div>
          </div>

          <div className="grid gap-4">
            <PanelSurface className="rounded-[var(--radius-xl)] bg-surface-strong p-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Color Language
              </p>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {colorSwatches.map((swatch) => (
                  <ColorSwatch
                    key={swatch.label}
                    label={swatch.label}
                    swatchClassName={swatch.swatchClassName}
                  />
                ))}
              </div>
            </PanelSurface>

            <PanelSurface className="rounded-[var(--radius-xl)] bg-[linear-gradient(160deg,rgba(255,255,255,0.3),transparent_70%)] p-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Surface Rules
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/70">
                {colorRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </PanelSurface>
          </div>
        </PanelSurface>

        <section className="grid gap-4 lg:grid-cols-3">
          {foundationPrinciples.map((item) => (
            <PanelSurface key={item.title} className="rounded-[var(--radius-lg)] px-5 py-6 sm:px-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                {item.title}
              </p>
              <p className="mt-3 text-base leading-7 text-foreground/72">{item.body}</p>
            </PanelSurface>
          ))}
        </section>

        <PanelSurface className="flex flex-col gap-4 rounded-[var(--radius-lg)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
              Current Baseline
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
              The system now defines token groups, reusable page primitives, a first auth journey,
              and a seeded template catalog that can be previewed before editor work begins.
            </p>
          </div>
          <StatusPill>Ready for sender onboarding</StatusPill>
        </PanelSurface>
      </main>
    </div>
  );
}
