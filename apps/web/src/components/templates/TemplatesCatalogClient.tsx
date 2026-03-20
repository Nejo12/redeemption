"use client";

import { useEffect, useState, useTransition } from "react";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { TemplatePreviewSurface } from "@/components/templates/TemplatePreviewSurface";
import { ActionLink } from "@/components/ui/ActionLink";
import { PanelSurface } from "@/components/ui/PanelSurface";
import { StatusPill } from "@/components/ui/StatusPill";
import { listTemplates } from "@/lib/templates-api";
import {
  getTemplateDimensionsLabel,
  templateCategoryLabels,
  TemplateCategoryValue,
  TemplateView,
} from "@/lib/templates-contract";

export function TemplatesCatalogClient() {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TemplateCategoryValue | "">("");
  const [templates, setTemplates] = useState<TemplateView[]>([]);
  const [availableCategories, setAvailableCategories] = useState<TemplateCategoryValue[]>([]);
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await listTemplates(search, category);
        setTemplates(response.templates);
        setAvailableCategories(response.availableCategories);
        setErrorMessage(null);
        setSelectedTemplateSlug((current) => {
          if (!response.templates.length) {
            return null;
          }

          if (current && response.templates.some((template) => template.slug === current)) {
            return current;
          }

          return response.templates[0]?.slug ?? null;
        });
      } catch (error) {
        setTemplates([]);
        setAvailableCategories([]);
        setSelectedTemplateSlug(null);
        setErrorMessage(error instanceof Error ? error.message : "Unable to load templates.");
      }
    });
  }, [category, search]);

  const selectedTemplate =
    templates.find((template) => template.slug === selectedTemplateSlug) ?? templates[0] ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <PanelSurface className="px-6 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Template catalog
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Seeded options for the first previewable card selection flow.
              </h2>
            </div>

            <StatusPill tone="accent">{templates.length} live templates</StatusPill>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Search
              </span>
              <input
                className="field-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or summary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Category
              </span>
              <select
                className="field-input"
                value={category}
                onChange={(event) => setCategory(event.target.value as TemplateCategoryValue | "")}
              >
                <option value="">All categories</option>
                {availableCategories.map((option) => (
                  <option key={option} value={option}>
                    {templateCategoryLabels[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}
          {isPending ? (
            <AuthMessage tone="info">Refreshing the template catalog.</AuthMessage>
          ) : null}

          <div className="grid gap-4">
            {templates.length === 0 ? (
              <PanelSurface className="px-5 py-5 text-sm leading-7 text-foreground/65">
                No templates match the current filter. Adjust the search or category to keep
                browsing.
              </PanelSurface>
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`rounded-[var(--radius-lg)] text-left transition-transform hover:-translate-y-0.5 ${
                    selectedTemplate?.slug === template.slug
                      ? "outline outline-2 outline-accent/30"
                      : ""
                  }`}
                  onClick={() => setSelectedTemplateSlug(template.slug)}
                >
                  <div className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                          {templateCategoryLabels[template.category]}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground">
                          {template.name}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-foreground/70">
                          {template.summary}
                        </p>
                      </div>

                      <StatusPill tone="success">{template.orientation}</StatusPill>
                    </div>

                    <TemplatePreviewSurface template={template} compact />

                    <div className="flex flex-wrap gap-3 text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                      <span>{getTemplateDimensionsLabel(template)}</span>
                      <span>{template.fields.length} mapped fields</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </PanelSurface>

      <PanelSurface className="px-6 py-6">
        {selectedTemplate ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                  Preview browser
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {selectedTemplate.name}
                </h2>
              </div>

              <ActionLink
                href="/dashboard"
                variant="secondary"
                className="min-h-10 px-4 py-2 text-xs"
              >
                Back to dashboard
              </ActionLink>
            </div>

            <p className="text-sm leading-7 text-foreground/72">{selectedTemplate.description}</p>

            <TemplatePreviewSurface template={selectedTemplate} />

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <PanelSurface className="px-5 py-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                  Field map
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/72">
                  {selectedTemplate.fields.map((field) => (
                    <li key={field.key}>
                      <strong>{field.label}</strong>: {field.kind.toLowerCase()}
                      {field.required ? " / required" : " / optional"}
                      {field.maxLength ? ` / max ${field.maxLength}` : ""}
                    </li>
                  ))}
                </ul>
              </PanelSurface>

              <PanelSurface className="px-5 py-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                  Ready for next slices
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/72">
                  <li>
                    Template metadata is now stored through Prisma instead of only in UI code.
                  </li>
                  <li>
                    The catalog supports browse, search, category filtering, and lightweight
                    previewing.
                  </li>
                  <li>
                    The field list is ready to drive the MVP editor and later rendering contracts.
                  </li>
                </ul>
              </PanelSurface>
            </div>
          </div>
        ) : (
          <AuthMessage tone="info">
            Select a template from the catalog to inspect its preview.
          </AuthMessage>
        )}
      </PanelSurface>
    </div>
  );
}
