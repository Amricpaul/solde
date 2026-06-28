import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatSigned } from "@/lib/money";
import type { SafeTransaction } from "@/modules/transactions/service";

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
}

export function TransactionRow({ txn }: { txn: SafeTransaction }) {
  const Icon = txn.type === "income" ? ArrowDownLeft : ArrowUpRight;
  const time = new Date(txn.date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const title = txn.note || txn.category?.name || (txn.type === "income" ? "Income" : "Expense");
  const subtitle = [txn.account?.name, time].filter(Boolean).join(" · ");

  return (
    <li className="flex items-center justify-between py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          style={txn.category?.color ? { color: txn.category.color } : undefined}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 pl-3 text-sm font-semibold tabular-nums",
          txn.type === "income"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-500 dark:text-red-400",
        )}
      >
        {formatSigned(txn.amountMinor, txn.currency, txn.type)}
      </span>
    </li>
  );
}

/** Flat list (used on the dashboard). */
export function RecentTransactions({ transactions }: { transactions: SafeTransaction[] }) {
  return (
    <ul className="divide-y divide-border">
      {transactions.map((t) => (
        <TransactionRow key={t.id} txn={t} />
      ))}
    </ul>
  );
}

/** Grouped-by-day list (used on the transactions page). */
export function TransactionList({ transactions }: { transactions: SafeTransaction[] }) {
  const groups: { label: string; items: SafeTransaction[] }[] = [];
  for (const t of transactions) {
    const label = dayLabel(t.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(t);
    else groups.push({ label, items: [t] });
  }

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">{g.label}</p>
          <ul className="divide-y divide-border">
            {g.items.map((t) => (
              <TransactionRow key={t.id} txn={t} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
