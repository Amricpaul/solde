import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { fromMinor } from "@/lib/money";
import { listCategories } from "@/modules/categories/service";
import { getBudget, listBudgetedCategoryIds } from "@/modules/budgets/service";
import { BudgetForm } from "@/modules/budgets/components/budget-form";
import { PageHeader } from "../../../_components/page-header";

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [budget, categories, budgetedIds] = await Promise.all([
    getBudget(user.id, id),
    listCategories(user.id),
    listBudgetedCategoryIds(user.id),
  ]);
  if (!budget) notFound();

  // Offer the current category plus any expense category that isn't already budgeted.
  const budgeted = new Set(budgetedIds);
  const available = categories.filter(
    (c) => c.type === "expense" && (c.id === budget.categoryId || !budgeted.has(c.id)),
  );

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Edit budget"
        description="Adjust the monthly limit, or remove this budget."
        backHref="/budgets"
      />
      <BudgetForm
        currency={user.baseCurrency}
        categories={available.map((c) => ({ id: c.id, name: c.name }))}
        budget={{
          id: budget.id,
          categoryId: budget.categoryId,
          amount: String(fromMinor(budget.amountMinor, budget.currency)),
        }}
      />
    </div>
  );
}
