export default function Home() {
  return (
    <div className="app-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
        <section className="panel-surface accent-ring grid gap-10 overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 text-sm tracking-[0.18em] text-accent uppercase">
              <span className="rounded-full bg-accent-soft px-3 py-1 font-semibold">
                Design System Seed
              </span>
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
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-accent-strong"
                href="/docs"
              >
                View System Goals
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-strong bg-surface-muted px-6 py-3 text-sm font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:bg-surface-strong"
                href="https://github.com/Nejo12/Project-One"
                target="_blank"
                rel="noopener noreferrer"
              >
                Review Repository
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[var(--radius-xl)] border border-border bg-surface-strong p-5 shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Color Language
              </p>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {[
                  ["Ink", "bg-foreground"],
                  ["Paper", "bg-surface-strong"],
                  ["Accent", "bg-accent"],
                  ["Soft", "bg-accent-soft"],
                ].map(([label, className]) => (
                  <div key={label} className="flex flex-col gap-2">
                    <div className={`h-18 rounded-2xl border border-border ${className}`} />
                    <span className="text-xs text-foreground/60">{label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[var(--radius-xl)] border border-border bg-[linear-gradient(160deg,rgba(255,255,255,0.3),transparent_70%)] p-5 shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Surface Rules
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/70">
                <li>Use semantic tokens instead of raw hex values in UI code.</li>
                <li>Prefer shared panel and action treatments over ad hoc utility stacks.</li>
                <li>Reserve the accent color for actions, emphasis, and active states.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Typography",
              body: "Strong hierarchy comes from scale, weight, and spacing before decorative styling.",
            },
            {
              title: "Spacing",
              body: "Panels, content blocks, and actions follow a restrained rhythm to keep pages readable.",
            },
            {
              title: "Composition",
              body: "Build from reusable surfaces and semantic tokens before extracting shared components.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="panel-surface rounded-[var(--radius-lg)] px-5 py-6 sm:px-6"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                {item.title}
              </p>
              <p className="mt-3 text-base leading-7 text-foreground/72">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="panel-surface flex flex-col gap-4 rounded-[var(--radius-lg)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
              Current Baseline
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
              The system currently defines token groups, surface conventions, and action patterns.
              The next step is extracting reusable UI primitives under `apps/web/src/components`.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[color:var(--success)]/12 px-4 py-2 text-sm font-medium text-[color:var(--success)]">
            Ready for component extraction
          </span>
        </section>
      </main>
    </div>
  );
}
