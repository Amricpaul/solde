import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils";
import { listAccounts } from "@/modules/accounts/service";
import { BankTemplateForm } from "@/modules/integrations/components/bank-template-form";
import { PageHeader } from "../../../../_components/page-header";

export default async function NewBankPage() {
  const user = await requireUser();
  const accounts = await listAccounts(user.id);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Add a bank"
        description="Teach Solde a bank's SMS format from two sample messages."
        backHref="/settings/integrations"
      />

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Add an account first — bank messages map to one of your accounts.
          </p>
          <Link href="/accounts/new" className={cn(buttonVariants({ variant: "default" }))}>
            Add an account
          </Link>
        </div>
      ) : (
        <BankTemplateForm
          accounts={accounts.map((a) => ({ id: a.id, name: a.name, currency: a.currency }))}
        />
      )}
    </div>
  );
}
