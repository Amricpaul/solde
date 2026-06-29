import Link from "next/link";
import { Check, Pencil } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import type { SafeGoal } from "@/modules/goals/service";
import { ContributeSheet } from "./contribute-sheet";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function GoalCard({ goal }: { goal: SafeGoal }) {
  const pct = Math.min(100, Math.round(goal.ratio * 100));
  const accent = goal.color ?? "var(--primary)";

  return (
    <div className="flex flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <p className="truncate font-medium">{goal.name}</p>
        </div>
        <Link
          href={`/goals/${goal.id}/edit`}
          aria-label={`Edit ${goal.name}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0")}
        >
          <Pencil />
        </Link>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          {formatMoney(goal.savedMinor, goal.currency)}
        </p>
        <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
          of {formatMoney(goal.targetMinor, goal.currency)}
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: goal.completed ? "var(--primary)" : accent }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        {goal.completed ? (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="size-3.5" />
            Goal reached
          </span>
        ) : (
          <span className="text-muted-foreground tabular-nums">
            {formatMoney(goal.remainingMinor, goal.currency)} to go · {pct}%
          </span>
        )}
        {goal.targetDate ? (
          <span className="shrink-0 text-muted-foreground">{formatDate(goal.targetDate)}</span>
        ) : null}
      </div>

      <div className="mt-4">
        <ContributeSheet goalId={goal.id} goalName={goal.name} currency={goal.currency} />
      </div>
    </div>
  );
}

export function GoalsManager({ goals }: { goals: SafeGoal[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {goals.map((g) => (
        <GoalCard key={g.id} goal={g} />
      ))}
    </div>
  );
}
