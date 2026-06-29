import { requireUser } from "@/lib/auth/dal";
import { AccountForm } from "@/modules/accounts/components/account-form";
import { PageHeader } from "../../_components/page-header";

export default async function NewAccountPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Add account" description="Bank accounts, cards, or cash." backHref="/accounts" />
      <AccountForm defaultCurrency={user.baseCurrency} />
    </div>
  );
}
