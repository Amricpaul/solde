import "server-only";

import { Types } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Goal, type GoalDoc } from "@/lib/db/models/goal.model";
import { toMinor } from "@/lib/money";
import type { GoalInput } from "./schema";

export class GoalNotFoundError extends Error {
  constructor() {
    super("Goal not found");
    this.name = "GoalNotFoundError";
  }
}

export interface SafeGoal {
  id: string;
  name: string;
  targetMinor: number;
  savedMinor: number;
  currency: string;
  color?: string;
  targetDate?: string; // ISO
  /** max(0, target − saved). */
  remainingMinor: number;
  /** saved / target (0–1+). */
  ratio: number;
  completed: boolean;
}

function toSafe(g: GoalDoc): SafeGoal {
  return {
    id: g._id.toString(),
    name: g.name,
    targetMinor: g.targetMinor,
    savedMinor: g.savedMinor,
    currency: g.currency,
    color: g.color ?? undefined,
    targetDate: g.targetDate ? (g.targetDate as Date).toISOString() : undefined,
    remainingMinor: Math.max(0, g.targetMinor - g.savedMinor),
    ratio: g.targetMinor > 0 ? g.savedMinor / g.targetMinor : 0,
    completed: g.savedMinor >= g.targetMinor,
  };
}

export async function listGoals(userId: string): Promise<SafeGoal[]> {
  await connectDB();
  const goals = await Goal.find({ userId }).sort({ createdAt: 1 }).lean();
  return goals.map((g) => toSafe(g as GoalDoc));
}

export async function getGoal(userId: string, id: string): Promise<SafeGoal | null> {
  await connectDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const g = await Goal.findOne({ _id: id, userId }).lean();
  return g ? toSafe(g as GoalDoc) : null;
}

export async function createGoal(
  userId: string,
  currency: string,
  input: GoalInput,
): Promise<string> {
  await connectDB();
  const goal = await Goal.create({
    userId,
    name: input.name,
    targetMinor: toMinor(input.targetAmount, currency),
    savedMinor: 0,
    currency,
    color: input.color || undefined,
    targetDate: input.targetDate ?? undefined,
  });
  return goal._id.toString();
}

export async function updateGoal(
  userId: string,
  id: string,
  currency: string,
  input: GoalInput,
): Promise<void> {
  await connectDB();
  // Keep savedMinor untouched; only the goal definition changes here.
  const set: Record<string, unknown> = {
    name: input.name,
    targetMinor: toMinor(input.targetAmount, currency),
    currency,
  };
  const unset: Record<string, ""> = {};
  if (input.color) set.color = input.color;
  else unset.color = "";
  if (input.targetDate) set.targetDate = input.targetDate;
  else unset.targetDate = "";

  await Goal.updateOne(
    { _id: id, userId },
    { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
  );
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  await connectDB();
  await Goal.deleteOne({ _id: id, userId });
}

/** Move money into ("add") or out of ("withdraw") a goal; saved never goes below 0. */
export async function contributeGoal(
  userId: string,
  id: string,
  amount: number,
  direction: "add" | "withdraw",
): Promise<void> {
  await connectDB();
  const goal = await Goal.findOne({ _id: id, userId });
  if (!goal) throw new GoalNotFoundError();
  const delta = toMinor(amount, goal.currency) * (direction === "withdraw" ? -1 : 1);
  goal.savedMinor = Math.max(0, goal.savedMinor + delta);
  await goal.save();
}
