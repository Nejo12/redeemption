import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { MomentsClient } from "@/components/moments/MomentsClient";
import { ActionLink } from "@/components/ui/ActionLink";

export default function MomentsPage() {
  return (
    <AuthPageShell
      eyebrow="Moments"
      title="Turn contact events into scheduled drafts with a real rule boundary."
      description="This slice starts the automation engine. It lets the user save one moment rule, computes the next occurrence, and seeds the next draft snapshot on top of the existing contacts, templates, storage, and rendering boundaries."
      asideTitle="Scope of this slice"
      asideBody="The rule form handles one contact at a time, supports birthday and one-off moments, and creates the next draft immediately as a scheduled or ready-for-review item. Full approvals and snooze/skip controls land in the next draft-management slice."
      asideLinks={
        <>
          <ActionLink href="/dashboard" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Dashboard
          </ActionLink>
          <ActionLink href="/contacts" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Contacts
          </ActionLink>
        </>
      }
    >
      <MomentsClient />
    </AuthPageShell>
  );
}
