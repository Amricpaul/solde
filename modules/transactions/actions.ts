"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { transactionSchema } from "./schema";
import {
  AccountNotFoundError,
  createTransaction,
  deleteTransaction,
  setTransactionCategory,
  updateTransaction,
} from "./service";

export interface TransactionFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

function parse(formData: FormData) {
  return transactionSchema.safeParse({
    type: formData.get("type"),
    accountId: formData.get("accountId"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId") ?? "",
    date: formData.get("date") || undefined,
    note: formData.get("note") ?? "",
  });
}

export async function createTransactionAction(
  _prev: TransactionFormState | undefined,
  formData: FormData,
): Promise<TransactionFormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await createTransaction(user.id, parsed.data);
  } catch (err) {
    if (err instanceof AccountNotFoundError) {
      return { error: "That account no longer exists. Pick another." };
    }
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}

export async function updateTransactionAction(
  _prev: TransactionFormState | undefined,
  formData: FormData,
): Promise<TransactionFormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing transaction id" };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await updateTransaction(user.id, id, parsed.data);
  } catch (err) {
    if (err instanceof AccountNotFoundError) {
      return { error: "That account no longer exists. Pick another." };
    }
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}

export async function deleteTransactionAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteTransaction(user.id, id);
    revalidatePath("/");
    revalidatePath("/transactions");
  }
  redirect("/transactions");
}

/** Inline categorize/clear from the history list. Invoked directly with args. */
export async function setTransactionCategoryAction(
  id: string,
  categoryId: string | null,
): Promise<void> {
  const user = await requireUser();
  if (!id) return;
  await setTransactionCategory(user.id, id, categoryId);
  revalidatePath("/");
  revalidatePath("/transactions");
}
