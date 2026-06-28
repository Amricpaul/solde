import { requireUser } from "@/lib/auth/dal";
import { listAccountsWithBalances } from "@/modules/accounts/service";
import { AccountsManager } from "@/modules/accounts/components/accounts-manager";
import { PageHeader } from "../_components/page-header";

export default async function AccountsPage() {
  const user = await requireUser();
  const accounts = await listAccountsWithBalances(user.id);

  return (
    <>
      <PageHeader title="Accounts" description="Your bank accounts, cards, and cash." />
      <AccountsManager
        accounts={accounts.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          currency: a.currency,
          last4: a.last4,
          institution: a.institution,
          openingBalanceMinor: a.openingBalanceMinor,
          balanceMinor: a.balanceMinor,
          creditLimitMinor: a.creditLimitMinor,
          statementDay: a.statementDay,
          paymentDueDay: a.paymentDueDay,
          availableMinor: a.availableMinor,
          utilization: a.utilization,
        }))}
        baseCurrency={user.baseCurrency}
      />
    </>
  );
}
