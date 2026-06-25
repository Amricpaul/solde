import { requireUser } from "@/lib/auth/dal";
import { RegisterPasskeyButton } from "@/modules/auth/components/passkey-buttons";
import { PageHeader } from "../_components/page-header";

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      {description ? <p className="mt-1 mb-4 text-sm text-muted-foreground">{description}</p> : <div className="mb-2" />}
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <div className="space-y-6">
        <Card title="Profile">
          <div className="divide-y divide-border">
            <SettingRow label="Name" value={user.name} />
            <SettingRow label="Email" value={user.email} />
            <SettingRow label="Base currency" value={user.baseCurrency} />
          </div>
        </Card>

        <Card
          title="Security"
          description="Add a passkey to sign in with Face ID or your fingerprint next time."
        >
          <RegisterPasskeyButton />
        </Card>
      </div>
    </>
  );
}
