import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils";
import { listCategories } from "@/modules/categories/service";
import { listBudgetedCategoryIds } from "@/modules/budgets/service";
import { BudgetForm } from "@/modules/budgets/components/budget-form";
import { PageHeader } from "../../_components/page-header";

export default async function NewBudgetPage() {
  const user = await requireUser();

  const [categories, budgetedIds] = await Promise.all([
    listCategories(user.id),
    listBudgetedCategoryIds(user.id),
  ]);

  // Budgets are spending limits, so only expense categories without one already.
  const budgeted = new Set(budgetedIds);
  const available = categories.filter((c) => c.type === "expense" && !budgeted.has(c.id));

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="New budget"
        description="Set a monthly spending limit for a category."
        backHref="/budgets"
      />

      {available.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Every expense category already has a budget. Add a new category first, or edit an
            existing budget.
          </p>
          <Link
            href="/settings/categories/new"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Add a category
          </Link>
        </div>
      ) : (
        <BudgetForm
          currency={user.baseCurrency}
          categories={available.map((c) => ({ id: c.id, name: c.name }))}
        />
      )}
    </div>
  );
}
