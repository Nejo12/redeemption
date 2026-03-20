import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SenderProfileForm } from "@/components/onboarding/SenderProfileForm";
import { ActionLink } from "@/components/ui/ActionLink";

export default function SenderProfileOnboardingPage() {
  return (
    <AuthPageShell
      eyebrow="Sender onboarding"
      title='Add the sender profile that marks the account as "ready".'
      description="This is the first onboarding checkpoint after authentication. It stores sender identity, return-address details, and locale/currency preferences against the authenticated account."
      asideTitle="Readiness gate"
      asideBody="Checkout does not exist yet, but the readiness rule does. This page makes that rule visible now so future product work can rely on a stable onboarding boundary."
      asideLinks={
        <>
          <ActionLink href="/dashboard" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Dashboard
          </ActionLink>
          <ActionLink href="/docs" variant="secondary" className="min-h-10 px-4 py-2 text-xs">
            Design docs
          </ActionLink>
        </>
      }
    >
      <SenderProfileForm />
    </AuthPageShell>
  );
}
