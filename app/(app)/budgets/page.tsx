import Link from "next/link";
import { Plus, Wallet } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils";
import { listBudgetsWithSpend } from "@/modules/budgets/service";
import { BudgetsManager } from "@/modules/budgets/components/budgets-manager";
import { PageHeader, EmptyState } from "../_components/page-header";

export default async function BudgetsPage() {
  const user = await requireUser();
  const budgets = await listBudgetsWithSpend(user.id);

  return (
    <>
      <PageHeader
        title="Budgets"
        description="Set monthly limits per category and track what's left to spend."
        action={
          <Link href="/budgets/new" className={cn(buttonVariants())}>
            <Plus />
            New budget
          </Link>
        }
      />

      {budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets set"
          description="Create a monthly limit for a category to see your spending progress here."
        >
          <Link href="/budgets/new" className={cn(buttonVariants({ variant: "default" }))}>
            <Plus />
            New budget
          </Link>
        </EmptyState>
      ) : (
        <BudgetsManager budgets={budgets} />
      )}
    </>
  );
}
