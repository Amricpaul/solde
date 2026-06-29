import { requireUser } from "@/lib/auth/dal";
import { ensureDefaultCategories, listCategories } from "@/modules/categories/service";
import { CategoryManager } from "@/modules/categories/components/category-manager";
import { PageHeader } from "../../_components/page-header";

export default async function CategoriesSettingsPage() {
  const user = await requireUser();
  await ensureDefaultCategories(user.id);
  const categories = await listCategories(user.id);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Categories"
        description="Group your income and expenses."
        backHref="/settings"
      />
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
        }))}
      />
    </div>
  );
}
