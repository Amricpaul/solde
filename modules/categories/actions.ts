"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { categorySchema } from "./schema";
import { createCategory, deleteCategory, updateCategory } from "./service";

export interface CategoryFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/transactions");
}

function parse(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    icon: formData.get("icon") ?? "",
    color: formData.get("color") ?? "",
  });
}

export async function createCategoryAction(
  _prev: CategoryFormState | undefined,
  formData: FormData,
): Promise<CategoryFormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  await createCategory(user.id, parsed.data);
  revalidateAll();
  return { success: true };
}

export async function updateCategoryAction(
  _prev: CategoryFormState | undefined,
  formData: FormData,
): Promise<CategoryFormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing category id" };
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  await updateCategory(user.id, id, parsed.data);
  revalidateAll();
  return { success: true };
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteCategory(user.id, id);
    revalidateAll();
  }
}
