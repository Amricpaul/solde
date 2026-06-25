import { Plus, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "../_components/page-header";

export default function GoalsPage() {
  return (
    <>
      <PageHeader
        title="Goals"
        description="Saving buckets for the things you're working toward."
        action={
          <Button disabled>
            <Plus />
            New goal
          </Button>
        }
      />
      <EmptyState
        icon={Target}
        title="No goals yet"
        description="Create a saving bucket — like a trip or a new device — and track your progress toward it."
      />
    </>
  );
}
