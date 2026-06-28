import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Category, type CategoryDoc } from "@/lib/db/models/category.model";
import { Transaction } from "@/lib/db/models/transaction.model";
import type { CategoryInput } from "./schema";

export interface SafeCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
}

// Seeded for new users; fully editable afterwards.
const DEFAULT_CATEGORIES: Omit<SafeCategory, "id">[] = [
  { name: "Groceries", type: "expense", icon: "shopping-cart", color: "#22c55e" },
  { name: "Rent", type: "expense", icon: "home", color: "#6366f1" },
  { name: "Transport", type: "expense", icon: "car", color: "#0ea5e9" },
  { name: "Dining", type: "expense", icon: "utensils", color: "#f97316" },
  { name: "Utilities", type: "expense", icon: "plug", color: "#eab308" },
  { name: "Shopping", type: "expense", icon: "shopping-bag", color: "#ec4899" },
  { name: "Health", type: "expense", icon: "heart-pulse", color: "#ef4444" },
  { name: "Entertainment", type: "expense", icon: "clapperboard", color: "#a855f7" },
  { name: "Salary", type: "income", icon: "wallet", color: "#10b981" },
  { name: "Refund", type: "income", icon: "rotate-ccw", color: "#14b8a6" },
  { name: "Interest", type: "income", icon: "piggy-bank", color: "#84cc16" },
  { name: "Gift", type: "income", icon: "gift", color: "#f59e0b" },
];

function toSafe(c: CategoryDoc): SafeCategory {
  return {
    id: c._id.toString(),
    name: c.name,
    type: c.type,
    icon: c.icon ?? undefined,
    color: c.color ?? undefined,
  };
}

/** Seed the default set the first time a user has no categories. */
export async function ensureDefaultCategories(userId: string): Promise<void> {
  await connectDB();
  const count = await Category.countDocuments({ userId });
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })));
  }
}

export async function listCategories(userId: string): Promise<SafeCategory[]> {
  await connectDB();
  const categories = await Category.find({ userId }).sort({ type: 1, name: 1 }).lean();
  return categories.map((c) => toSafe(c as CategoryDoc));
}

export async function createCategory(userId: string, input: CategoryInput): Promise<string> {
  await connectDB();
  const category = await Category.create({
    userId,
    name: input.name,
    type: input.type,
    icon: input.icon || undefined,
    color: input.color || undefined,
  });
  return category._id.toString();
}

export async function updateCategory(userId: string, id: string, input: CategoryInput): Promise<void> {
  await connectDB();
  await Category.updateOne(
    { _id: id, userId },
    {
      $set: {
        name: input.name,
        type: input.type,
        icon: input.icon || undefined,
        color: input.color || undefined,
      },
    },
  );
}

export async function deleteCategory(userId: string, id: string): Promise<void> {
  await connectDB();
  // Keep the transactions, just un-categorize them.
  await Transaction.updateMany({ userId, categoryId: id }, { $unset: { categoryId: "" } });
  await Category.deleteOne({ _id: id, userId });
}
