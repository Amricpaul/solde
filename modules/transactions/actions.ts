"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { transactionSchema } from "./schema";
import { AccountNotFoundError, createTransaction } from "./service";

export interface TransactionFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export async function createTransactionAction(
  _prev: TransactionFormState | undefined,
  formData: FormData,
): Promise<TransactionFormState> {
  const user = await requireUser();

  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    accountId: formData.get("accountId"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId") ?? "",
    date: formData.get("date") || undefined,
    note: formData.get("note") ?? "",
  });

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
