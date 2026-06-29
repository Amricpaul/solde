import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils";
import { listAccounts } from "@/modules/accounts/service";
import { listCategories } from "@/modules/categories/service";
import { TransactionForm } from "@/modules/transactions/components/transaction-form";
import { PageHeader } from "../../_components/page-header";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireUser();
  const { type } = await searchParams;
  const initialType = type === "income" ? "income" : "expense";

  const [accounts, categories] = await Promise.all([
    listAccounts(user.id),
    listCategories(user.id),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Add transaction"
        description="Record income or an expense."
        backHref="/transactions"
      />

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            You need an account before adding transactions.
          </p>
          <Link href="/accounts/new" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
            Add an account
          </Link>
        </div>
      ) : (
        <TransactionForm
          accounts={accounts.map((a) => ({ id: a.id, name: a.name, currency: a.currency }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
          initialType={initialType}
        />
      )}
    </div>
  );
}
