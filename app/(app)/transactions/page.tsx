import { Plus, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "../_components/page-header";

export default function TransactionsPage() {
  return (
    <>
      <PageHeader
        title="Transactions"
        description="A record of everything you earn and spend."
        action={
          <Button disabled>
            <Plus />
            Add transaction
          </Button>
        }
      />
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Add your first income or expense to start building your history."
      />
    </>
  );
}
