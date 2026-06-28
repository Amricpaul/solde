"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteCategoryAction } from "@/modules/categories/actions";
import { CategoryFormSheet, type ManagedCategory } from "./category-form-sheet";

function CategoryRow({ category, onEdit }: { category: ManagedCategory; onEdit: () => void }) {
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
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${category.name}`} onClick={onEdit}>
          <Pencil />
        </Button>
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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedCategory | undefined>(undefined);

  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");

  const editCategory = (c: ManagedCategory) => {
    setEditing(c);
    setOpen(true);
  };

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
                <CategoryRow key={c.id} category={c} onEdit={() => editCategory(c)} />
              ))}
            </ul>
          </div>
        ) : null,
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setEditing(undefined);
          setOpen(true);
        }}
      >
        <Plus />
        Add category
      </Button>

      <CategoryFormSheet
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={setOpen}
        category={editing}
      />
    </div>
  );
}
