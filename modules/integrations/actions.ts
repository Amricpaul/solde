"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { revokeApiKey, rotateApiKey } from "./service";
import { bankTemplateInput } from "./schema";
import { createBankTemplate, deleteBankTemplate } from "./bank-service";
import { learnTemplate, type LearnedTemplate } from "@/modules/ingestion/template-learning";

export interface ApiKeyActionState {
  /** The raw key — returned ONCE, immediately after generation. */
  key?: string;
  error?: string;
}

export async function rotateApiKeyAction(): Promise<ApiKeyActionState> {
  const user = await requireUser();
  try {
    const key = await rotateApiKey(user.id);
    revalidatePath("/settings/integrations");
    return { key };
  } catch {
    return { error: "Could not generate a key. Try again." };
  }
}

export async function revokeApiKeyAction(): Promise<void> {
  const user = await requireUser();
  await revokeApiKey(user.id);
  revalidatePath("/settings/integrations");
}

// --- Bank templates ---------------------------------------------------------

export interface AnalyzeProposal extends LearnedTemplate {
  preview: { amount?: string; date?: string; note?: string };
}

export interface AnalyzeState {
  proposal?: AnalyzeProposal;
  error?: string;
}

/** Diff two sample messages and return the learned template + a preview of msg A. */
export async function analyzeMessagesAction(
  messageA: string,
  messageB: string,
): Promise<AnalyzeState> {
  await requireUser();
  if (!messageA?.trim() || !messageB?.trim()) {
    return { error: "Paste two messages from the same bank card." };
  }

  const learned = learnTemplate(messageA, messageB);
  let preview: AnalyzeProposal["preview"] = {};
  try {
    const groups = new RegExp(learned.pattern).exec(messageA.trim())?.groups ?? {};
    preview = {
      amount: learned.amountGroup ? groups[learned.amountGroup]?.trim() : undefined,
      date: learned.dateGroup ? groups[learned.dateGroup]?.trim() : undefined,
      note: learned.noteGroup ? groups[learned.noteGroup]?.trim() : undefined,
    };
  } catch {
    return { error: "Couldn't derive a pattern from those messages. Try two recent ones." };
  }

  return { proposal: { ...learned, preview } };
}

export interface BankTemplateFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export async function saveBankTemplateAction(
  _prev: BankTemplateFormState | undefined,
  formData: FormData,
): Promise<BankTemplateFormState> {
  const user = await requireUser();
  const parsed = bankTemplateInput.safeParse({
    label: formData.get("label"),
    accountId: formData.get("accountId"),
    senderMatch: formData.get("senderMatch"),
    identifier: formData.get("identifier") ?? "",
    currency: formData.get("currency"),
    direction: formData.get("direction"),
    pattern: formData.get("pattern"),
    amountGroup: formData.get("amountGroup"),
    dateGroup: formData.get("dateGroup") ?? "",
    noteGroup: formData.get("noteGroup") ?? "",
    directionRules: formData.get("directionRules") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  await createBankTemplate(user.id, parsed.data);
  revalidatePath("/settings/integrations");
  return { success: true };
}

export async function deleteBankTemplateAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteBankTemplate(user.id, id);
    revalidatePath("/settings/integrations");
  }
}
