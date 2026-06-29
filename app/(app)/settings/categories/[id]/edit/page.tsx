import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/modules/categories/service";
import { CategoryForm } from "@/modules/categories/components/category-form";
import { PageHeader } from "../../../../_components/page-header";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const category = (await listCategories(user.id)).find((c) => c.id === id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Edit category" description="Used to group your transactions." backHref="/settings/categories" />
      <CategoryForm
        category={{ id: category.id, name: category.name, type: category.type, color: category.color }}
        redirectTo="/settings/categories"
      />
    </div>
  );
}
