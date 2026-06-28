import { requireUser } from "@/lib/auth/dal";
import { listAccountsWithBalances } from "@/modules/accounts/service";
import { getDashboardSummary } from "@/modules/transactions/service";
import { DashboardContent } from "./_components/dashboard-content";

export default async function DashboardPage() {
  const user = await requireUser();
  const [accounts, summary] = await Promise.all([
    listAccountsWithBalances(user.id),
    getDashboardSummary(user.id),
  ]);
  const totalBalanceMinor = accounts.reduce((sum, a) => sum + a.balanceMinor, 0);

  return (
    <DashboardContent
      name={user.name}
      baseCurrency={user.baseCurrency}
      totalBalanceMinor={totalBalanceMinor}
      monthIncomeMinor={summary.monthIncomeMinor}
      monthExpenseMinor={summary.monthExpenseMinor}
      accounts={accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        currency: a.currency,
        balanceMinor: a.balanceMinor,
        last4: a.last4,
        creditLimitMinor: a.creditLimitMinor,
        availableMinor: a.availableMinor,
        utilization: a.utilization,
      }))}
      recent={summary.recent}
    />
  );
}
