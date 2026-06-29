import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { deleteBudgetAction } from "@/modules/budgets/actions";
import type { BudgetWithSpend } from "@/modules/budgets/service";

function BudgetCard({ budget }: { budget: BudgetWithSpend }) {
  const pct = Math.round(budget.ratio * 100);
  const over = budget.remainingMinor < 0;
  const barColor = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: budget.categoryColor ?? "var(--muted-foreground)" }}
          />
          <p className="truncate font-medium">{budget.categoryName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/budgets/${budget.id}/edit`}
            aria-label={`Edit ${budget.categoryName} budget`}
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          >
            <Pencil />
          </Link>
          <form action={deleteBudgetAction}>
            <input type="hidden" name="id" value={budget.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${budget.categoryName} budget`}
            >
              <Trash2 />
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          {formatMoney(budget.spentMinor, budget.currency)}
        </p>
        <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
          of {formatMoney(budget.limitMinor, budget.currency)}
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>

      <p className={cn("mt-2 text-xs tabular-nums", over ? "text-red-500" : "text-muted-foreground")}>
        {over
          ? `${formatMoney(-budget.remainingMinor, budget.currency)} over budget`
          : `${formatMoney(budget.remainingMinor, budget.currency)} left · ${pct}% used`}
      </p>
    </div>
  );
}

export function BudgetsManager({ budgets }: { budgets: BudgetWithSpend[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {budgets.map((b) => (
        <BudgetCard key={b.id} budget={b} />
      ))}
    </div>
  );
}
