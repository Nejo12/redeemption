import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ContactsClient } from "@/components/contacts/ContactsClient";
import { ActionLink } from "@/components/ui/ActionLink";

export default function ContactsPage() {
  return (
    <AuthPageShell
      eyebrow="Contacts"
      title="Manage contact records through the first protected domain route."
      description="This slice starts the real product domain after auth and sender onboarding. It proves authenticated CRUD, search, and duplicate warnings on top of the current API and web foundations."
      asideTitle="Scope of this slice"
      asideBody="Contacts are implemented here without addresses or import yet. That keeps the module boundary clear and gives the next slice a clean place to add address ownership."
      asideLinks={
        <>
          <ActionLink href="/dashboard" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Dashboard
          </ActionLink>
          <ActionLink
            href="/onboarding/sender-profile"
            variant="secondary"
            className="min-h-10 px-4 py-2 text-xs"
          >
            Sender onboarding
          </ActionLink>
        </>
      }
    >
      <ContactsClient />
    </AuthPageShell>
  );
}
