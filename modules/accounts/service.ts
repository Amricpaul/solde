import "server-only";

import { Types } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Account, ACCOUNT_TYPES, type AccountDoc } from "@/lib/db/models/account.model";
import { Transaction } from "@/lib/db/models/transaction.model";
import { toMinor } from "@/lib/money";
import type { AccountInput } from "./schema";

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface SafeAccount {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  last4?: string;
  institution?: string;
  color?: string;
  openingBalanceMinor: number;
  creditLimitMinor?: number;
  statementDay?: number;
  paymentDueDay?: number;
  archived: boolean;
}

export interface AccountWithBalance extends SafeAccount {
  /** Asset accounts: cash on hand. Credit cards: amount currently owed. */
  balanceMinor: number;
  /** Signed contribution to net worth (assets positive, credit-card debt negative). */
  netWorthMinor: number;
  /** Credit cards only: limit − owed. */
  availableMinor?: number;
  /** Credit cards only: owed / limit (0–1+). */
  utilization?: number;
}

function toSafe(a: AccountDoc): SafeAccount {
  return {
    id: a._id.toString(),
    name: a.name,
    type: a.type,
    currency: a.currency,
    last4: a.last4 ?? undefined,
    institution: a.institution ?? undefined,
    color: a.color ?? undefined,
    openingBalanceMinor: a.openingBalanceMinor,
    creditLimitMinor: a.creditLimitMinor ?? undefined,
    statementDay: a.statementDay ?? undefined,
    paymentDueDay: a.paymentDueDay ?? undefined,
    archived: a.archived,
  };
}

function creditFields(input: AccountInput, currency: string) {
  if (input.type !== "credit_card") {
    return {
      $unset: { creditLimitMinor: "", statementDay: "", paymentDueDay: "" },
    };
  }
  return {
    $set: {
      creditLimitMinor: input.creditLimit != null ? toMinor(input.creditLimit, currency) : undefined,
      statementDay: input.statementDay,
      paymentDueDay: input.paymentDueDay,
    },
  };
}

export async function createAccount(userId: string, input: AccountInput): Promise<string> {
  await connectDB();
  const isCredit = input.type === "credit_card";
  // New accounts go to the end of the manual sort order.
  const sortOrder = await Account.countDocuments({ userId, archived: false });
  const account = await Account.create({
    userId,
    name: input.name,
    type: input.type,
    currency: input.currency,
    last4: input.last4 || undefined,
    institution: input.institution || undefined,
    sortOrder,
    openingBalanceMinor: toMinor(input.openingBalance ?? 0, input.currency),
    creditLimitMinor: isCredit && input.creditLimit != null ? toMinor(input.creditLimit, input.currency) : undefined,
    statementDay: isCredit ? input.statementDay : undefined,
    paymentDueDay: isCredit ? input.paymentDueDay : undefined,
  });
  return account._id.toString();
}

export async function updateAccount(userId: string, id: string, input: AccountInput): Promise<void> {
  await connectDB();
  const credit = creditFields(input, input.currency);
  await Account.updateOne(
    { _id: id, userId },
    {
      $set: {
        name: input.name,
        type: input.type,
        currency: input.currency,
        last4: input.last4 || undefined,
        institution: input.institution || undefined,
        openingBalanceMinor: toMinor(input.openingBalance ?? 0, input.currency),
        ...(credit.$set ?? {}),
      },
      ...(credit.$unset ? { $unset: credit.$unset } : {}),
    },
  );
}

export async function archiveAccount(userId: string, id: string): Promise<void> {
  await connectDB();
  await Account.updateOne({ _id: id, userId }, { $set: { archived: true } });
}

/** Persist a new manual order: sortOrder = position in the given id list. */
export async function reorderAccounts(userId: string, ids: string[]): Promise<void> {
  await connectDB();
  const uid = new Types.ObjectId(userId);
  const ops = ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id), userId: uid },
        update: { $set: { sortOrder: index } },
      },
    }));
  if (ops.length) await Account.bulkWrite(ops);
}

export async function listAccounts(userId: string): Promise<SafeAccount[]> {
  await connectDB();
  const accounts = await Account.find({ userId, archived: false })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return accounts.map((a) => toSafe(a as AccountDoc));
}

/** Accounts with live balances. Credit cards are treated as liabilities. */
export async function listAccountsWithBalances(userId: string): Promise<AccountWithBalance[]> {
  await connectDB();
  const accounts = await Account.find({ userId, archived: false })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const agg = await Transaction.aggregate<{ _id: Types.ObjectId; net: number }>([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$accountId",
        // net = income − expense
        net: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amountMinor", { $multiply: ["$amountMinor", -1] }],
          },
        },
      },
    },
  ]);
  const netByAccount = new Map(agg.map((r) => [r._id.toString(), r.net]));

  return accounts.map((doc) => {
    const safe = toSafe(doc as AccountDoc);
    const net = netByAccount.get(safe.id) ?? 0; // income − expense

    if (safe.type === "credit_card") {
      // Charges (expenses) increase debt; payments (income) reduce it.
      const owedMinor = safe.openingBalanceMinor - net;
      const availableMinor =
        safe.creditLimitMinor != null ? safe.creditLimitMinor - owedMinor : undefined;
      const utilization =
        safe.creditLimitMinor && safe.creditLimitMinor > 0
          ? owedMinor / safe.creditLimitMinor
          : undefined;
      return {
        ...safe,
        balanceMinor: owedMinor,
        netWorthMinor: -owedMinor,
        availableMinor,
        utilization,
      };
    }

    const balanceMinor = safe.openingBalanceMinor + net;
    return { ...safe, balanceMinor, netWorthMinor: balanceMinor };
  });
}
