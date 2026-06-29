import { requireUser } from "@/lib/auth/dal";
import { getApiKeyStatus } from "@/modules/integrations/service";
import { listBankTemplates } from "@/modules/integrations/bank-service";
import { BankTemplatesList } from "@/modules/integrations/components/bank-templates-list";
import { PageHeader } from "../../_components/page-header";
import { ApiKeySection } from "./_components/api-key-section";

export default async function IntegrationsPage() {
  const user = await requireUser();
  const [apiKey, templates] = await Promise.all([
    getApiKeyStatus(user.id),
    listBankTemplates(user.id),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="SMS import"
        description="Let an Apple Shortcut turn bank-alert messages into transactions automatically."
        backHref="/settings"
      />

      <ApiKeySection status={apiKey} />
      <BankTemplatesList templates={templates} />
    </div>
  );
}
