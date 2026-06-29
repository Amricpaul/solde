"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatSigned } from "@/lib/money";
import { setTransactionCategoryAction } from "@/modules/transactions/actions";
import { UNCATEGORIZED } from "@/modules/transactions/filters";
import type { SafeTransaction } from "@/modules/transactions/service";

export interface HistoryCategory {
  id: string;
  name: string;
  type: "income" | "expense";
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  return d
    .toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
    .toUpperCase();
}

function HistoryRow({ txn, categories }: { txn: SafeTransaction; categories: HistoryCategory[] }) {
  const [pending, startTransition] = useTransition();
  const Icon = txn.type === "income" ? ArrowDownLeft : ArrowUpRight;
  const time = new Date(txn.date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const title = txn.note || txn.category?.name || (txn.type === "income" ? "Income" : "Expense");
  const subtitle = [txn.account?.name, time].filter(Boolean).join(" · ");
  const options = categories.filter((c) => c.type === txn.type);
  const value = txn.category?.id ?? UNCATEGORIZED;

  function onChange(next: string) {
    if (next === value) return;
    startTransition(() => {
      setTransactionCategoryAction(txn.id, next === UNCATEGORIZED ? null : next);
    });
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3.5">
      <Link
        href={`/transactions/${txn.id}/edit`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
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
      </Link>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            txn.type === "income"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400",
          )}
        >
          {formatSigned(txn.amountMinor, txn.currency, txn.type)}
        </span>

        <Select value={value} onValueChange={(v) => onChange(v ?? UNCATEGORIZED)} disabled={pending}>
          <SelectTrigger
            size="sm"
            aria-label="Set category"
            className={cn(
              "h-7 rounded-full border-dashed text-xs",
              !txn.category && "text-muted-foreground",
              pending && "opacity-60",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNCATEGORIZED}>Uncategorized</SelectItem>
            {options.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </li>
  );
}

/** Grouped-by-day history with inline category assignment and row-level edit links. */
export function TransactionHistory({
  transactions,
  categories,
}: {
  transactions: SafeTransaction[];
  categories: HistoryCategory[];
}) {
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
              <HistoryRow key={t.id} txn={t} categories={categories} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
