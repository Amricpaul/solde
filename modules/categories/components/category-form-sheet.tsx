"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

export function CategoryFormSheet({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ManagedCategory;
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
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  const err = (n: string) => state?.fieldErrors?.[n]?.[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{editing ? "Edit category" : "Add category"}</SheetTitle>
          <SheetDescription>Used to group your transactions.</SheetDescription>
        </SheetHeader>

        <form action={formAction} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {editing ? <input type="hidden" name="id" value={category!.id} /> : null}
            <input type="hidden" name="type" value={type} />

            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" name="name" defaultValue={category?.name} placeholder="e.g. Groceries" />
              {err("name") ? <p className="text-xs text-destructive">{err("name")}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType((v ?? "expense") as "income" | "expense")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <SheetFooter className="border-t border-border">
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Add category"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
