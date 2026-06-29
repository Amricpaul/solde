"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { contributeSchema, goalSchema } from "./schema";
import { contributeGoal, createGoal, deleteGoal, GoalNotFoundError, updateGoal } from "./service";

export interface GoalFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/goals");
}

function parse(formData: FormData) {
  return goalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    targetDate: formData.get("targetDate") || undefined,
    color: formData.get("color") ?? "",
  });
}

export async function createGoalAction(
  _prev: GoalFormState | undefined,
  formData: FormData,
): Promise<GoalFormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  await createGoal(user.id, user.baseCurrency, parsed.data);
  revalidateAll();
  return { success: true };
}

export async function updateGoalAction(
  _prev: GoalFormState | undefined,
  formData: FormData,
): Promise<GoalFormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing goal id" };
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  await updateGoal(user.id, id, user.baseCurrency, parsed.data);
  revalidateAll();
  return { success: true };
}

export async function deleteGoalAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteGoal(user.id, id);
    revalidateAll();
  }
}

export async function contributeGoalAction(
  _prev: GoalFormState | undefined,
  formData: FormData,
): Promise<GoalFormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing goal id" };

  const parsed = contributeSchema.safeParse({
    amount: formData.get("amount"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  try {
    await contributeGoal(user.id, id, parsed.data.amount, parsed.data.direction);
  } catch (err) {
    if (err instanceof GoalNotFoundError) return { error: "That goal no longer exists." };
    throw err;
  }

  revalidateAll();
  return { success: true };
}
