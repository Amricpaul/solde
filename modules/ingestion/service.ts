import "server-only";

import { createHash } from "node:crypto";

import { connectDB } from "@/lib/db/connect";
import { Account } from "@/lib/db/models/account.model";
import { BankTemplate, type BankTemplateDoc } from "@/lib/db/models/bank-template.model";
import { Transaction } from "@/lib/db/models/transaction.model";
import { fromMinor, toMinor } from "@/lib/money";
import { AccountNotFoundError } from "@/modules/transactions/service";
import { categorize } from "./categorizer";
import type { IngestRequest } from "./schema";
import { parseSms, type ParserTemplate } from "./sms-parser";

export interface IngestResult {
  id: string;
  deduped: boolean;
  type: "income" | "expense";
  amount: number; // major units, for the notification
  currency: string;
  accountLabel: string;
  note?: string;
  date: string; // ISO
  categoryName?: string;
  needsReview: boolean;
}

function toParserTemplate(doc: BankTemplateDoc): ParserTemplate {
  return {
    id: doc._id.toString(),
    accountId: String(doc.accountId),
    senderMatch: doc.senderMatch,
    identifier: doc.identifier ?? undefined,
    pattern: doc.pattern,
    slots: {
      amount: doc.slots?.amount ?? "",
      date: doc.slots?.date ?? undefined,
      note: doc.slots?.note ?? undefined,
    },
    currency: doc.currency,
    direction: doc.direction,
    directionRules: {
      income: doc.directionRules?.income ?? [],
      expense: doc.directionRules?.expense ?? [],
    },
  };
}

/** Stable dedupe key: same SMS re-fired on the same day maps to one transaction. */
function buildExternalId(sender: string, message: string, date: Date): string {
  const dayKey = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  const normalized = message.trim().replace(/\s+/g, " ");
  const hash = createHash("sha256").update(`${sender}|${normalized}|${dayKey}`).digest("hex");
  return `sms:${hash.slice(0, 32)}`;
}

export async function ingestTransaction(
  userId: string,
  input: IngestRequest,
): Promise<IngestResult> {
  await connectDB();

  const templateDocs = await BankTemplate.find({ userId }).lean();
  const parsed = parseSms(
    templateDocs.map((d) => toParserTemplate(d as unknown as BankTemplateDoc)),
    input.message,
    input.sender,
  );

  const account = await Account.findOne({ _id: parsed.accountId, userId, archived: false })
    .select("currency name last4")
    .lean();
  if (!account) throw new AccountNotFoundError();

  const amountMinor = toMinor(parsed.amount, account.currency);
  const date = parsed.date ?? input.receivedAt ?? new Date();
  const externalId = buildExternalId(input.sender, input.message, date);

  // Cache-first, then AI. Non-fatal: a null result just leaves it uncategorized.
  const categorized = await categorize(userId, parsed.note, parsed.type);

  const res = await Transaction.updateOne(
    { userId, externalId },
    {
      $setOnInsert: {
        userId,
        accountId: parsed.accountId,
        categoryId: categorized?.categoryId ?? undefined,
        type: parsed.type,
        amountMinor,
        currency: account.currency,
        date,
        note: parsed.note || undefined,
        source: "shortcut",
        externalId,
      },
    },
    { upsert: true },
  );

  const deduped = res.upsertedCount === 0;
  let id = res.upsertedId?.toString() ?? "";
  if (!id) {
    const existing = await Transaction.findOne({ userId, externalId }).select("_id").lean();
    id = existing?._id.toString() ?? "";
  }

  const accountLabel = account.last4 ? `${account.name} ••${account.last4}` : account.name;

  return {
    id,
    deduped,
    type: parsed.type,
    amount: fromMinor(amountMinor, account.currency),
    currency: account.currency,
    accountLabel,
    note: parsed.note,
    date: date.toISOString(),
    categoryName: categorized?.categoryName,
    needsReview: false,
  };
}
