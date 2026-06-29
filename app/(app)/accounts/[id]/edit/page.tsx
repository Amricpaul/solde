import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { listAccountsWithBalances } from "@/modules/accounts/service";
import { AccountForm } from "@/modules/accounts/components/account-form";
import { PageHeader } from "../../../_components/page-header";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const account = (await listAccountsWithBalances(user.id)).find((a) => a.id === id);
  if (!account) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Edit account" description="Bank accounts, cards, or cash." backHref="/accounts" />
      <AccountForm
        defaultCurrency={user.baseCurrency}
        account={{
          id: account.id,
          name: account.name,
          type: account.type,
          currency: account.currency,
          last4: account.last4,
          institution: account.institution,
          openingBalanceMinor: account.openingBalanceMinor,
          balanceMinor: account.balanceMinor,
          creditLimitMinor: account.creditLimitMinor,
          statementDay: account.statementDay,
          paymentDueDay: account.paymentDueDay,
          availableMinor: account.availableMinor,
          utilization: account.utilization,
        }}
      />
    </div>
  );
}
