"use client";

import type { CSSProperties } from "react";
import { PanelSurface } from "@/components/ui/PanelSurface";
import {
  getTemplateDimensionsLabel,
  templateCategoryLabels,
  TemplateView,
} from "@/lib/templates-contract";

type TemplatePreviewSurfaceProps = {
  template: TemplateView;
  compact?: boolean;
};

export function TemplatePreviewSurface({ template, compact = false }: TemplatePreviewSurfaceProps) {
  const photoField = template.fields.find((field) => field.kind === "PHOTO");

  return (
    <PanelSurface
      className={`overflow-hidden ${
        compact ? "rounded-[var(--radius-lg)] px-4 py-4" : "rounded-[var(--radius-xl)] px-6 py-6"
      }`}
      style={
        {
          backgroundColor: template.surfaceHex,
          color: template.textHex,
          borderColor: `${template.accentHex}44`,
        } as CSSProperties
      }
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase"
            style={{ backgroundColor: `${template.accentHex}18`, color: template.accentHex }}
          >
            {template.previewLabel}
          </span>
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase opacity-60">
            {templateCategoryLabels[template.category]}
          </span>
        </div>

        <div className={compact ? "space-y-2" : "space-y-3"}>
          <h3
            className={
              compact
                ? "text-xl font-semibold leading-tight"
                : "text-3xl font-semibold leading-tight"
            }
          >
            {template.previewHeadline}
          </h3>
          <p
            className={compact ? "text-sm leading-6 opacity-80" : "text-base leading-7 opacity-80"}
          >
            {template.previewMessage}
          </p>
        </div>

        <div
          className={`grid flex-1 gap-3 ${
            template.orientation === "LANDSCAPE" ? "md:grid-cols-[1.15fr_0.85fr]" : ""
          }`}
        >
          {photoField ? (
            <div
              className={`rounded-[var(--radius-md)] border px-4 py-4 ${
                compact ? "min-h-28" : "min-h-36"
              }`}
              style={{ borderColor: `${template.accentHex}33`, backgroundColor: "#FFFFFF66" }}
            >
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase opacity-55">
                Photo area
              </p>
              <div
                className="mt-3 rounded-[var(--radius-md)] border border-dashed"
                style={{
                  minHeight: compact ? 72 : 108,
                  borderColor: `${template.accentHex}55`,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.36), rgba(255,255,255,0.08))",
                }}
              />
            </div>
          ) : null}

          <div
            className={`rounded-[var(--radius-md)] border px-4 py-4 ${
              compact ? "min-h-28" : "min-h-36"
            }`}
            style={{ borderColor: `${template.accentHex}33`, backgroundColor: "#FFFFFF55" }}
          >
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase opacity-55">
              Copy structure
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 opacity-75">
              {template.fields.map((field) => (
                <li key={field.key}>
                  {field.label}
                  {field.required ? " *" : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px] font-semibold tracking-[0.14em] uppercase opacity-60">
          <span>{template.orientation}</span>
          <span>{getTemplateDimensionsLabel(template)}</span>
          <span>{template.fields.length} fields</span>
        </div>
      </div>
    </PanelSurface>
  );
}
