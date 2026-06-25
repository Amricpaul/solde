import { Plus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "../_components/page-header";

export default function BudgetsPage() {
  return (
    <>
      <PageHeader
        title="Budgets"
        description="Set monthly limits per category and track what's left to spend."
        action={
          <Button disabled>
            <Plus />
            New budget
          </Button>
        }
      />
      <EmptyState
        icon={Wallet}
        title="No budgets set"
        description="Create a monthly limit for a category to see your spending progress here."
      />
    </>
  );
}
