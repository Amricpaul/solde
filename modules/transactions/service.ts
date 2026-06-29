import "server-only";

import { Types, type QueryFilter } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Account } from "@/lib/db/models/account.model";
import { Transaction, type TransactionDoc } from "@/lib/db/models/transaction.model";
import { toMinor } from "@/lib/money";
import { rememberMerchant } from "@/modules/ingestion/categorizer";
import { UNCATEGORIZED, type TransactionFilters } from "./filters";
import type { TransactionInput } from "./schema";

/** Escape user input before it's used in a Mongo $regex. */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class AccountNotFoundError extends Error {
  constructor() {
    super("Account not found");
    this.name = "AccountNotFoundError";
  }
}

export interface SafeTransaction {
  id: string;
  type: "income" | "expense";
  amountMinor: number;
  currency: string;
  date: string; // ISO
  note?: string;
  account: { id: string; name: string } | null;
  category: { id: string; name: string; color?: string } | null;
}

export interface DashboardSummary {
  monthIncomeMinor: number;
  monthExpenseMinor: number;
  recent: SafeTransaction[];
}

type PopulatedRef = { _id: Types.ObjectId; name: string; color?: string } | null | undefined;

function toSafe(t: TransactionDoc): SafeTransaction {
  const account = t.accountId as unknown as PopulatedRef;
  const category = t.categoryId as unknown as PopulatedRef;
  return {
    id: t._id.toString(),
    type: t.type,
    amountMinor: t.amountMinor,
    currency: t.currency,
    date: (t.date as Date).toISOString(),
    note: t.note ?? undefined,
    account: account?._id ? { id: account._id.toString(), name: account.name } : null,
    category: category?._id
      ? { id: category._id.toString(), name: category.name, color: category.color }
      : null,
  };
}

export async function createTransaction(userId: string, input: TransactionInput): Promise<string> {
  await connectDB();

  const account = await Account.findOne({ _id: input.accountId, userId, archived: false })
    .select("currency")
    .lean();
  if (!account) throw new AccountNotFoundError();

  const txn = await Transaction.create({
    userId,
    accountId: input.accountId,
    categoryId: input.categoryId || undefined,
    type: input.type,
    amountMinor: toMinor(input.amount, account.currency),
    currency: account.currency,
    date: input.date ?? new Date(),
    note: input.note || undefined,
    source: "manual",
  });
  return txn._id.toString();
}

export async function listTransactions(
  userId: string,
  { limit = 50, ...filters }: { limit?: number } & TransactionFilters = {},
): Promise<SafeTransaction[]> {
  await connectDB();

  const query: QueryFilter<TransactionDoc> = { userId };
  if (filters.type) query.type = filters.type;
  if (filters.accountId && Types.ObjectId.isValid(filters.accountId)) {
    query.accountId = new Types.ObjectId(filters.accountId);
  }
  if (filters.categoryId === UNCATEGORIZED) {
    query.categoryId = null; // matches both null and missing
  } else if (filters.categoryId && Types.ObjectId.isValid(filters.categoryId)) {
    query.categoryId = new Types.ObjectId(filters.categoryId);
  }
  if (filters.q) {
    query.note = { $regex: escapeRegex(filters.q), $options: "i" };
  }

  const txns = await Transaction.find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .populate("accountId", "name")
    .populate("categoryId", "name color")
    .lean();
  return txns.map((t) => toSafe(t as unknown as TransactionDoc));
}

export async function getTransaction(userId: string, id: string): Promise<SafeTransaction | null> {
  await connectDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const txn = await Transaction.findOne({ _id: id, userId })
    .populate("accountId", "name")
    .populate("categoryId", "name color")
    .lean();
  return txn ? toSafe(txn as unknown as TransactionDoc) : null;
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: TransactionInput,
): Promise<void> {
  await connectDB();

  const account = await Account.findOne({ _id: input.accountId, userId, archived: false })
    .select("currency")
    .lean();
  if (!account) throw new AccountNotFoundError();

  // Build $set/$unset so clearing the note or category actually removes the field.
  const set: Record<string, unknown> = {
    accountId: input.accountId,
    type: input.type,
    amountMinor: toMinor(input.amount, account.currency),
    currency: account.currency,
    date: input.date ?? new Date(),
  };
  const unset: Record<string, ""> = {};
  if (input.note) set.note = input.note;
  else unset.note = "";
  if (input.categoryId) set.categoryId = input.categoryId;
  else unset.categoryId = "";

  await Transaction.updateOne(
    { _id: id, userId },
    { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
  );
}

export async function deleteTransaction(userId: string, id: string): Promise<void> {
  await connectDB();
  await Transaction.deleteOne({ _id: id, userId });
}

/** Lightweight inline categorize (or clear) from the history list. */
export async function setTransactionCategory(
  userId: string,
  id: string,
  categoryId: string | null,
): Promise<void> {
  await connectDB();
  if (categoryId && Types.ObjectId.isValid(categoryId)) {
    await Transaction.updateOne({ _id: id, userId }, { $set: { categoryId } });
    // Learning loop: teach the merchant→category cache from manual edits so the
    // AI importer reuses the user's choice next time (manual wins over AI).
    const txn = await Transaction.findOne({ _id: id, userId }).select("note").lean();
    if (txn?.note) await rememberMerchant(userId, txn.note, categoryId, "manual");
  } else {
    await Transaction.updateOne({ _id: id, userId }, { $unset: { categoryId: "" } });
  }
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  await connectDB();
  const oid = new Types.ObjectId(userId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const agg = await Transaction.aggregate<{ _id: "income" | "expense"; total: number }>([
    { $match: { userId: oid, date: { $gte: startOfMonth } } },
    { $group: { _id: "$type", total: { $sum: "$amountMinor" } } },
  ]);

  const monthIncomeMinor = agg.find((r) => r._id === "income")?.total ?? 0;
  const monthExpenseMinor = agg.find((r) => r._id === "expense")?.total ?? 0;
  const recent = await listTransactions(userId, { limit: 8 });

  return { monthIncomeMinor, monthExpenseMinor, recent };
}
