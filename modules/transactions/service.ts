import "server-only";

import { Types } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Account } from "@/lib/db/models/account.model";
import { Transaction, type TransactionDoc } from "@/lib/db/models/transaction.model";
import { toMinor } from "@/lib/money";
import type { TransactionInput } from "./schema";

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
  { limit = 50 }: { limit?: number } = {},
): Promise<SafeTransaction[]> {
  await connectDB();
  const txns = await Transaction.find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .populate("accountId", "name")
    .populate("categoryId", "name color")
    .lean();
  return txns.map((t) => toSafe(t as unknown as TransactionDoc));
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
