import Link from "next/link";
import { Plus, Target } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils";
import { listGoals } from "@/modules/goals/service";
import { GoalsManager } from "@/modules/goals/components/goals-manager";
import { PageHeader, EmptyState } from "../_components/page-header";

export default async function GoalsPage() {
  const user = await requireUser();
  const goals = await listGoals(user.id);

  return (
    <>
      <PageHeader
        title="Goals"
        description="Saving buckets for the things you're working toward."
        action={
          <Link href="/goals/new" className={cn(buttonVariants())}>
            <Plus />
            New goal
          </Link>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create a saving bucket — like a trip or a new device — and track your progress toward it."
        >
          <Link href="/goals/new" className={cn(buttonVariants({ variant: "default" }))}>
            <Plus />
            New goal
          </Link>
        </EmptyState>
      ) : (
        <GoalsManager goals={goals} />
      )}
    </>
  );
}
