import { requireUser } from "@/lib/auth/dal";
import { RegisterPasskeyButton } from "@/modules/auth/components/passkey-buttons";
import { PageHeader } from "../../_components/page-header";

export default async function SecuritySettingsPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Security"
        description="Add a passkey to sign in with Face ID or your fingerprint next time."
        backHref="/settings"
      />
      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
        <RegisterPasskeyButton />
      </div>
    </div>
  );
}
