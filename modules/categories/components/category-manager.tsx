import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteCategoryAction } from "@/modules/categories/actions";
import { type ManagedCategory } from "./category-form";

function CategoryRow({ category }: { category: ManagedCategory }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: category.color ?? "var(--muted-foreground)" }}
        />
        <span className="truncate text-sm font-medium">{category.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/settings/categories/${category.id}/edit`}
          aria-label={`Edit ${category.name}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <Pencil />
        </Link>
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={category.id} />
          <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Delete ${category.name}`}>
            <Trash2 />
          </Button>
        </form>
      </div>
    </li>
  );
}

export function CategoryManager({ categories }: { categories: ManagedCategory[] }) {
  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");

  return (
    <div className="space-y-5">
      {[
        { label: "Expense", items: expense },
        { label: "Income", items: income },
      ].map((group) =>
        group.items.length > 0 ? (
          <div key={group.label}>
            <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">
              {group.label.toUpperCase()}
            </p>
            <ul className="divide-y divide-border">
              {group.items.map((c) => (
                <CategoryRow key={c.id} category={c} />
              ))}
            </ul>
          </div>
        ) : null,
      )}

      <Link href="/settings/categories/new" className={cn(buttonVariants({ variant: "outline" }))}>
        <Plus />
        Add category
      </Link>
    </div>
  );
}
