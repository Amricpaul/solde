import { requireUser } from "@/lib/auth/dal";
import { GoalForm } from "@/modules/goals/components/goal-form";
import { PageHeader } from "../../_components/page-header";

export default async function NewGoalPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="New goal"
        description="Set a target to save toward."
        backHref="/goals"
      />
      <GoalForm currency={user.baseCurrency} />
    </div>
  );
}
