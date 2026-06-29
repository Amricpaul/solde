import { requireUser } from "@/lib/auth/dal";
import { CategoryForm } from "@/modules/categories/components/category-form";
import { PageHeader } from "../../../_components/page-header";

export default async function NewCategoryPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Add category" description="Used to group your transactions." backHref="/settings/categories" />
      <CategoryForm redirectTo="/settings/categories" />
    </div>
  );
}
