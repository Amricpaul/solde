import "server-only";

import { Types } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { BankTemplate, type BankTemplateDoc } from "@/lib/db/models/bank-template.model";
import type { BankTemplateInput } from "./schema";

export interface SafeBankTemplate {
  id: string;
  label: string;
  accountId: string;
  accountName?: string;
  senderMatch: string;
  identifier?: string;
  currency: string;
  direction: "income" | "expense";
}

type PopulatedAccount = { _id: Types.ObjectId; name: string } | null | undefined;

function toSafe(doc: BankTemplateDoc): SafeBankTemplate {
  const account = doc.accountId as unknown as PopulatedAccount;
  return {
    id: doc._id.toString(),
    label: doc.label,
    accountId: account?._id ? account._id.toString() : String(doc.accountId),
    accountName: account?.name,
    senderMatch: doc.senderMatch,
    identifier: doc.identifier ?? undefined,
    currency: doc.currency,
    direction: doc.direction,
  };
}

export async function listBankTemplates(userId: string): Promise<SafeBankTemplate[]> {
  await connectDB();
  const docs = await BankTemplate.find({ userId })
    .populate("accountId", "name")
    .sort({ createdAt: 1 })
    .lean();
  return docs.map((d) => toSafe(d as unknown as BankTemplateDoc));
}

function parseDirectionRules(raw?: string): { income: string[]; expense: string[] } {
  if (!raw) return { income: [], expense: [] };
  try {
    const p = JSON.parse(raw) as { income?: unknown; expense?: unknown };
    return {
      income: Array.isArray(p.income) ? p.income.map(String) : [],
      expense: Array.isArray(p.expense) ? p.expense.map(String) : [],
    };
  } catch {
    return { income: [], expense: [] };
  }
}

export async function createBankTemplate(
  userId: string,
  input: BankTemplateInput,
): Promise<string> {
  await connectDB();
  const doc = await BankTemplate.create({
    userId,
    label: input.label,
    accountId: input.accountId,
    senderMatch: input.senderMatch,
    identifier: input.identifier || undefined,
    pattern: input.pattern,
    slots: {
      amount: input.amountGroup,
      date: input.dateGroup || undefined,
      note: input.noteGroup || undefined,
    },
    currency: input.currency.toUpperCase(),
    direction: input.direction,
    directionRules: parseDirectionRules(input.directionRules),
  });
  return doc._id.toString();
}

export async function deleteBankTemplate(userId: string, id: string): Promise<void> {
  await connectDB();
  await BankTemplate.deleteOne({ _id: id, userId });
}
