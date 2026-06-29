"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { accountSchema } from "./schema";
import { archiveAccount, createAccount, reorderAccounts, updateAccount } from "./service";

export interface AccountFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/settings");
  revalidatePath("/transactions");
}

export async function reorderAccountsAction(ids: string[]): Promise<void> {
  const user = await requireUser();
  if (!Array.isArray(ids) || ids.length === 0) return;
  await reorderAccounts(user.id, ids);
  revalidateAll();
}

function parse(formData: FormData) {
  return accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    currency: formData.get("currency"),
    last4: formData.get("last4") ?? "",
    institution: formData.get("institution") ?? "",
    openingBalance: formData.get("openingBalance") ?? 0,
    creditLimit: formData.get("creditLimit") ?? "",
    statementDay: formData.get("statementDay") ?? "",
    paymentDueDay: formData.get("paymentDueDay") ?? "",
  });
}

export async function createAccountAction(
  _prev: AccountFormState | undefined,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  await createAccount(user.id, parsed.data);
  revalidateAll();
  return { success: true };
}

export async function updateAccountAction(
  _prev: AccountFormState | undefined,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing account id" };
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  await updateAccount(user.id, id, parsed.data);
  revalidateAll();
  return { success: true };
}

export async function archiveAccountAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await archiveAccount(user.id, id);
    revalidateAll();
  }
}
