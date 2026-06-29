import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { fromMinor } from "@/lib/money";
import { getGoal } from "@/modules/goals/service";
import { GoalForm } from "@/modules/goals/components/goal-form";
import { PageHeader } from "../../../_components/page-header";

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const goal = await getGoal(user.id, id);
  if (!goal) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Edit goal"
        description="Adjust the target, or remove this goal."
        backHref="/goals"
      />
      <GoalForm
        currency={user.baseCurrency}
        goal={{
          id: goal.id,
          name: goal.name,
          targetAmount: String(fromMinor(goal.targetMinor, goal.currency)),
          targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : undefined,
          color: goal.color,
        }}
      />
    </div>
  );
}
