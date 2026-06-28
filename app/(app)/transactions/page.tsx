import { Receipt } from "lucide-react";

import { requireUser } from "@/lib/auth/dal";
import { listTransactions } from "@/modules/transactions/service";
import { AddTransactionButton } from "@/modules/transactions/components/quick-add-trigger";
import { TransactionList } from "@/modules/transactions/components/transaction-list";
import { PageHeader, EmptyState } from "../_components/page-header";

export default async function TransactionsPage() {
  const user = await requireUser();
  const transactions = await listTransactions(user.id, { limit: 200 });

  return (
    <>
      <PageHeader
        title="Transactions"
        description="A record of everything you earn and spend."
        action={<AddTransactionButton />}
      />
      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Add your first income or expense to start building your history."
        />
      ) : (
        <div className="rounded-3xl bg-card px-5 py-4 ring-1 ring-foreground/10 lg:px-6">
          <TransactionList transactions={transactions} />
        </div>
      )}
    </>
  );
}
