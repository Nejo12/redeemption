import { TemplatesCatalogClient } from "@/components/templates/TemplatesCatalogClient";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ActionLink } from "@/components/ui/ActionLink";

export default function TemplatesPage() {
  return (
    <AuthPageShell
      eyebrow="Templates"
      title="Browse the seeded template catalog before the editor and rendering slices land."
      description="This page turns the phase-three foundation into a real browse-and-preview flow. It loads seeded metadata from the API, exposes category filtering, and shows lightweight previews tied to actual template fields."
      asideTitle="What this slice proves"
      asideBody="Template metadata now lives in the API boundary and database migration history rather than only in frontend mocks. The current surface is intentionally browse-first so the next slices can focus on personalization and rendering."
      asideLinks={
        <>
          <ActionLink href="/dashboard" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Dashboard
          </ActionLink>
          <ActionLink href="/docs" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            System docs
          </ActionLink>
        </>
      }
    >
      <TemplatesCatalogClient />
    </AuthPageShell>
  );
}
