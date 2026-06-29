import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { fromMinor } from "@/lib/money";
import { listAccounts } from "@/modules/accounts/service";
import { listCategories } from "@/modules/categories/service";
import { getTransaction } from "@/modules/transactions/service";
import { TransactionForm } from "@/modules/transactions/components/transaction-form";
import { PageHeader } from "../../../_components/page-header";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [txn, accounts, categories] = await Promise.all([
    getTransaction(user.id, id),
    listAccounts(user.id),
    listCategories(user.id),
  ]);
  if (!txn) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Edit transaction"
        description="Update the details, or delete this entry."
        backHref="/transactions"
      />
      <TransactionForm
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, currency: a.currency }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
        initialType={txn.type}
        transaction={{
          id: txn.id,
          type: txn.type,
          accountId: txn.account?.id ?? accounts[0]?.id ?? "",
          amount: String(fromMinor(txn.amountMinor, txn.currency)),
          categoryId: txn.category?.id ?? "",
          date: new Date(txn.date).toISOString().slice(0, 10),
          note: txn.note ?? "",
        }}
      />
    </div>
  );
}
