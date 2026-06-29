"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  createBudgetAction,
  deleteBudgetAction,
  updateBudgetAction,
  type BudgetFormState,
} from "@/modules/budgets/actions";

export interface BudgetFormCategory {
  id: string;
  name: string;
}

/** Existing budget values (amount in major units) for edit mode. */
export interface BudgetFormValues {
  id: string;
  categoryId: string;
  amount: string;
}

export function BudgetForm({
  categories,
  currency,
  budget,
}: {
  categories: BudgetFormCategory[];
  currency: string;
  budget?: BudgetFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(budget);
  const [state, formAction, pending] = useActionState<BudgetFormState | undefined, FormData>(
    isEdit ? updateBudgetAction : createBudgetAction,
    undefined,
  );
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? categories[0]?.id ?? "");

  useEffect(() => {
    if (state?.success) {
      router.push("/budgets");
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("categoryId") ? (
            <p className="text-xs text-destructive">{fieldError("categoryId")}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Monthly limit ({currency})</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={budget?.amount}
          />
          {fieldError("amount") ? (
            <p className="text-xs text-destructive">{fieldError("amount")}</p>
          ) : null}
        </div>

        {budget ? <input type="hidden" name="id" value={budget.id} /> : null}
        <input type="hidden" name="categoryId" value={categoryId} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" className="flex-1" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create budget"}
          </Button>
        </div>

        {isEdit ? (
          <Button
            type="submit"
            form="delete-budget"
            variant="ghost"
            size="lg"
            disabled={pending}
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete budget
          </Button>
        ) : null}
      </form>

      {budget ? (
        <form id="delete-budget" action={deleteBudgetAction}>
          <input type="hidden" name="id" value={budget.id} />
        </form>
      ) : null}
    </>
  );
}
