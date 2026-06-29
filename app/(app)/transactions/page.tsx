import { Receipt, SearchX } from "lucide-react";

import { requireUser } from "@/lib/auth/dal";
import { listAccounts } from "@/modules/accounts/service";
import { listCategories } from "@/modules/categories/service";
import { listTransactions } from "@/modules/transactions/service";
import { parseTransactionFilters, hasActiveFilters } from "@/modules/transactions/filters";
import { AddTransactionButton } from "@/modules/transactions/components/quick-add-trigger";
import { TransactionFilters } from "@/modules/transactions/components/transaction-filters";
import { TransactionHistory } from "@/modules/transactions/components/transaction-history";
import { PageHeader, EmptyState } from "../_components/page-header";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const filters = parseTransactionFilters(await searchParams);

  const [transactions, accounts, categories] = await Promise.all([
    listTransactions(user.id, { ...filters, limit: 1000 }),
    listAccounts(user.id),
    listCategories(user.id),
  ]);

  const filtering = hasActiveFilters(filters);
  // Distinguish "no transactions at all" from "none match the current filters".
  const emptyAndUnfiltered = transactions.length === 0 && !filtering;

  return (
    <>
      <PageHeader
        title="Transactions"
        description="A record of everything you earn and spend."
        action={<AddTransactionButton />}
      />

      {emptyAndUnfiltered ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Add your first income or expense to start building your history."
        />
      ) : (
        <>
          <TransactionFilters
            accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />

          {transactions.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching transactions"
              description="Try a different search or clear your filters."
            />
          ) : (
            <>
              <p className="mb-2 text-xs text-muted-foreground">
                {transactions.length} {transactions.length === 1 ? "result" : "results"}
              </p>
              <div className="rounded-3xl bg-card px-5 py-4 ring-1 ring-foreground/10 lg:px-6">
                <TransactionHistory
                  transactions={transactions}
                  categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
