"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryFormState,
} from "@/modules/categories/actions";

export interface ManagedCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
}

export function CategoryForm({
  category,
  redirectTo = "/settings",
}: {
  category?: ManagedCategory;
  redirectTo?: string;
}) {
  const router = useRouter();
  const editing = Boolean(category);
  const [state, formAction, pending] = useActionState<CategoryFormState | undefined, FormData>(
    editing ? updateCategoryAction : createCategoryAction,
    undefined,
  );
  const [type, setType] = useState<"income" | "expense">(category?.type ?? "expense");

  useEffect(() => {
    if (state?.success) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [state, router, redirectTo]);

  const err = (n: string) => state?.fieldErrors?.[n]?.[0];

  return (
    <form action={formAction} className="space-y-4">
      {editing ? <input type="hidden" name="id" value={category!.id} /> : null}
      <input type="hidden" name="type" value={type} />

      <div className="space-y-1.5">
        <FloatingLabelInput id="cat-name" name="name" label="Name" defaultValue={category?.name} />
        {err("name") ? <p className="text-xs text-destructive">{err("name")}</p> : null}
      </div>

      <FloatingLabelSelect
        label="Type"
        value={type}
        onValueChange={(v) => setType((v ?? "expense") as "income" | "expense")}
        items={{ expense: "Expense", income: "Income" }}
      >
        <SelectItem value="expense">Expense</SelectItem>
        <SelectItem value="income">Income</SelectItem>
      </FloatingLabelSelect>

      <div className="space-y-1.5">
        <Label htmlFor="cat-color">Color</Label>
        <Input
          id="cat-color"
          name="color"
          type="color"
          defaultValue={category?.color ?? "#eb5e28"}
          className="h-9 w-16 p-1"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving…" : editing ? "Save changes" : "Add category"}
        </Button>
      </div>
    </form>
  );
}
