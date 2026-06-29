import "server-only";

import { Types } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Budget, type BudgetDoc } from "@/lib/db/models/budget.model";
import { Transaction } from "@/lib/db/models/transaction.model";
import { toMinor } from "@/lib/money";
import type { BudgetInput } from "./schema";

export class DuplicateBudgetError extends Error {
  constructor() {
    super("A budget for this category already exists");
    this.name = "DuplicateBudgetError";
  }
}

export interface BudgetWithSpend {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  currency: string;
  limitMinor: number;
  spentMinor: number;
  /** limit − spent; negative when over budget. */
  remainingMinor: number;
  /** spent / limit (0–1+). */
  ratio: number;
}

export interface SafeBudget {
  id: string;
  categoryId: string;
  amountMinor: number;
  currency: string;
}

type PopulatedCategory = { _id: Types.ObjectId; name: string; color?: string } | null | undefined;

/** Start (inclusive) and end (exclusive) of the current calendar month. */
function currentMonthRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

export async function listBudgetsWithSpend(userId: string): Promise<BudgetWithSpend[]> {
  await connectDB();
  const budgets = await Budget.find({ userId })
    .populate("categoryId", "name color")
    .sort({ createdAt: 1 })
    .lean();
  if (budgets.length === 0) return [];

  const { start, end } = currentMonthRange();
  const spendAgg = await Transaction.aggregate<{ _id: Types.ObjectId; total: number }>([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        type: "expense",
        categoryId: { $ne: null },
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: "$categoryId", total: { $sum: "$amountMinor" } } },
  ]);
  const spentByCategory = new Map(spendAgg.map((r) => [r._id.toString(), r.total]));

  return budgets.map((b) => {
    const category = b.categoryId as unknown as PopulatedCategory;
    const categoryId = category?._id?.toString() ?? "";
    const spentMinor = spentByCategory.get(categoryId) ?? 0;
    const limitMinor = b.amountMinor;
    return {
      id: b._id.toString(),
      categoryId,
      categoryName: category?.name ?? "Unknown category",
      categoryColor: category?.color ?? undefined,
      currency: b.currency,
      limitMinor,
      spentMinor,
      remainingMinor: limitMinor - spentMinor,
      ratio: limitMinor > 0 ? spentMinor / limitMinor : 0,
    };
  });
}

export async function getBudget(userId: string, id: string): Promise<SafeBudget | null> {
  await connectDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const b = await Budget.findOne({ _id: id, userId }).lean();
  return b
    ? {
        id: (b as BudgetDoc)._id.toString(),
        categoryId: b.categoryId.toString(),
        amountMinor: b.amountMinor,
        currency: b.currency,
      }
    : null;
}

/** Category ids that already have a budget — used to avoid offering duplicates. */
export async function listBudgetedCategoryIds(userId: string): Promise<string[]> {
  await connectDB();
  const budgets = await Budget.find({ userId }).select("categoryId").lean();
  return budgets.map((b) => b.categoryId.toString());
}

export async function createBudget(
  userId: string,
  currency: string,
  input: BudgetInput,
): Promise<string> {
  await connectDB();
  try {
    const budget = await Budget.create({
      userId,
      categoryId: input.categoryId,
      amountMinor: toMinor(input.amount, currency),
      currency,
    });
    return budget._id.toString();
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      throw new DuplicateBudgetError();
    }
    throw err;
  }
}

export async function updateBudget(
  userId: string,
  id: string,
  currency: string,
  input: BudgetInput,
): Promise<void> {
  await connectDB();
  await Budget.updateOne(
    { _id: id, userId },
    {
      $set: {
        categoryId: input.categoryId,
        amountMinor: toMinor(input.amount, currency),
        currency,
      },
    },
  );
}

export async function deleteBudget(userId: string, id: string): Promise<void> {
  await connectDB();
  await Budget.deleteOne({ _id: id, userId });
}
