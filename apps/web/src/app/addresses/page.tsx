import { AddressesClient } from "@/components/addresses/AddressesClient";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ActionLink } from "@/components/ui/ActionLink";

export default function AddressesPage() {
  return (
    <AuthPageShell
      eyebrow="Addresses"
      title="Manage a validated address book before linking addresses to contacts."
      description="This slice introduces address CRUD, country selection, and validation state so the next step can focus purely on connecting contacts to primary and alternate addresses."
      asideTitle="Scope of this slice"
      asideBody="Addresses are user-owned and validated at the schema level here. Contact assignment and primary-address rules will follow as the next contacts integration step."
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
      <AddressesClient />
    </AuthPageShell>
  );
}
