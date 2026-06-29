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
  // Net worth: assets add, credit-card debt subtracts (netWorthMinor is signed).
  const totalBalanceMinor = accounts.reduce((sum, a) => sum + a.netWorthMinor, 0);

  return (
    <DashboardContent
      name={user.name}
      baseCurrency={user.baseCurrency}
      totalBalanceMinor={totalBalanceMinor}
      monthIncomeMinor={summary.monthIncomeMinor}
      monthExpenseMinor={summary.monthExpenseMinor}
      recent={summary.recent}
    />
  );
}
