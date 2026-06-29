"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { budgetSchema } from "./schema";
import { createBudget, deleteBudget, DuplicateBudgetError, updateBudget } from "./service";

export interface BudgetFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/budgets");
}

function parse(formData: FormData) {
  return budgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
  });
}

export async function createBudgetAction(
  _prev: BudgetFormState | undefined,
  formData: FormData,
): Promise<BudgetFormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  try {
    await createBudget(user.id, user.baseCurrency, parsed.data);
  } catch (err) {
    if (err instanceof DuplicateBudgetError) {
      return { error: "You already have a budget for that category." };
    }
    throw err;
  }

  revalidateAll();
  return { success: true };
}

export async function updateBudgetAction(
  _prev: BudgetFormState | undefined,
  formData: FormData,
): Promise<BudgetFormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing budget id" };
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  await updateBudget(user.id, id, user.baseCurrency, parsed.data);
  revalidateAll();
  return { success: true };
}

export async function deleteBudgetAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteBudget(user.id, id);
    revalidateAll();
  }
}
