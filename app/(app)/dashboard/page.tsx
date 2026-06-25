import { ArrowDownLeft, ArrowUpRight, Receipt, Wallet } from "lucide-react";

import { requireUser } from "@/lib/auth/dal";
import { PageHeader, EmptyState } from "../_components/page-header";

const stats = [
  { label: "Total balance", value: "—", icon: Wallet, hint: "Across all activity" },
  { label: "Income this month", value: "—", icon: ArrowUpRight, hint: "Money in" },
  { label: "Expenses this month", value: "—", icon: ArrowDownLeft, hint: "Money out" },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader title={`Welcome, ${firstName}`} description="Your money at a glance." />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recent activity</h2>
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Once you start tracking income and expenses, your latest activity will show up here."
      />
    </>
  );
}
