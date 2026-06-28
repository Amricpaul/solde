import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { requireUser } from "@/lib/auth/dal";
import { ensureDefaultCategories, listCategories } from "@/modules/categories/service";
import { logoutAction } from "@/modules/auth/actions";
import { RegisterPasskeyButton } from "@/modules/auth/components/passkey-buttons";
import { CategoryManager } from "@/modules/categories/components/category-manager";
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
  await ensureDefaultCategories(user.id);
  const categories = await listCategories(user.id);

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

        <Card title="Categories" description="Group your income and expenses.">
          <CategoryManager
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              color: c.color,
            }))}
          />
        </Card>

        <Card
          title="Security"
          description="Add a passkey to sign in with Face ID or your fingerprint next time."
        >
          <RegisterPasskeyButton />
        </Card>

        <Card title="Appearance" description="Choose how Solde looks on this device.">
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <ModeToggle />
          </div>
        </Card>

        <Card title="Account">
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="gap-2 text-destructive">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
