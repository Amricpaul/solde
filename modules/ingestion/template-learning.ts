// Learn a reusable SMS parser by diffing two sample messages from the same bank
// card. Tokens identical in both are the bank's fixed template; tokens that
// differ are the variable fields (amount, date, merchant, balance…). Pure, no DB.

export type SlotRole = "amount" | "date" | "note" | "ignore";

export interface LearnedSlot {
  group: string; // capture group name, e.g. "v0"
  role: SlotRole;
  samples: [string, string]; // the two observed values
}

export interface LearnedTemplate {
  pattern: string; // RegExp source with named groups
  slots: LearnedSlot[];
  amountGroup?: string;
  dateGroup?: string;
  noteGroup?: string;
  currency?: string;
  identifier?: string;
  identifierCandidates: string[];
  direction: "income" | "expense";
  directionRules: { income: string[]; expense: string[] };
}

const EXPENSE_KEYWORDS = [
  "spent", "debited", "debit", "purchase", "withdrawn", "withdrawal",
  "paid", "payment", "deducted", "charged", "sent",
];
const INCOME_KEYWORDS = [
  "credited", "credit", "received", "deposit", "deposited", "refund",
  "salary", "reversal", "cashback",
];
const CURRENCY_RE = /\b(AED|USD|EUR|GBP|SAR|QAR|KWD|BHD|OMR|INR|PKR|EGP|JOD|JPY)\b/;

function tokenize(message: string): string[] {
  return message.trim().split(/\s+/).filter(Boolean);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Diff two token arrays into ordered equal/diff blocks via an LCS DP table. */
type Block = { type: "equal"; tokens: string[] } | { type: "diff"; a: string[]; b: string[] };

function diffBlocks(a: string[], b: string[]): Block[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const blocks: Block[] = [];
  let i = 0;
  let j = 0;
  let pendingA: string[] = [];
  let pendingB: string[] = [];
  const flushDiff = () => {
    if (pendingA.length || pendingB.length) {
      blocks.push({ type: "diff", a: pendingA, b: pendingB });
      pendingA = [];
      pendingB = [];
    }
  };

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      flushDiff();
      const tokens: string[] = [];
      while (i < n && j < m && a[i] === b[j]) {
        tokens.push(a[i]);
        i++;
        j++;
      }
      blocks.push({ type: "equal", tokens });
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      pendingA.push(a[i++]);
    } else {
      pendingB.push(b[j++]);
    }
  }
  while (i < n) pendingA.push(a[i++]);
  while (j < m) pendingB.push(b[j++]);
  flushDiff();
  return blocks;
}

function looksLikeAmount(s: string): boolean {
  return /\d/.test(s) && /^[A-Za-z]{0,3}\.?\s?[\d][\d,]*\.?\d*$/.test(s.trim());
}

function looksLikeDate(s: string): boolean {
  return (
    /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(s) ||
    /\d{1,2}[-\s][A-Za-z]{3}[-\s]?\d{0,4}/.test(s) ||
    /\d{4}-\d{2}-\d{2}/.test(s)
  );
}

function isMostlyAlpha(s: string): boolean {
  const letters = (s.match(/[A-Za-z]/g) ?? []).length;
  const digits = (s.match(/\d/g) ?? []).length;
  return letters > 0 && letters >= digits;
}

function classify(samples: [string, string]): SlotRole {
  if (samples.every(looksLikeAmount)) return "amount";
  if (samples.every(looksLikeDate)) return "date";
  if (samples.some(isMostlyAlpha)) return "note";
  return "ignore";
}

function detectIdentifiers(staticText: string): string[] {
  const out = new Set<string>();
  const patterns = [
    /ending\s+(\d{3,6})/gi,
    /x{2,}\s*(\d{3,6})/gi,
    /\*{2,}\s*(\d{3,6})/g,
    /\bA\/?C\b[^\d]*(\d{3,6})/gi,
    /\bcard\b[^\d]*(\d{3,6})/gi,
  ];
  for (const re of patterns) {
    for (const m of staticText.matchAll(re)) out.add(m[1]);
  }
  if (out.size === 0) {
    // Fallback: a standalone 3-6 digit run in the fixed text.
    const m = /\b(\d{3,6})\b/.exec(staticText);
    if (m) out.add(m[1]);
  }
  return [...out];
}

function detectDirection(message: string): {
  direction: "income" | "expense";
  rules: { income: string[]; expense: string[] };
} {
  const lower = message.toLowerCase();
  const income = INCOME_KEYWORDS.filter((k) => lower.includes(k));
  const expense = EXPENSE_KEYWORDS.filter((k) => lower.includes(k));
  // Prefer whichever set matched; ties / none default to expense (the common case).
  const direction = income.length > expense.length ? "income" : "expense";
  return { direction, rules: { income, expense } };
}

export function learnTemplate(messageA: string, messageB: string): LearnedTemplate {
  const a = tokenize(messageA);
  const b = tokenize(messageB);
  const blocks = diffBlocks(a, b);

  const parts: string[] = [];
  const slots: LearnedSlot[] = [];
  const staticTokens: string[] = [];
  let slotIndex = 0;

  blocks.forEach((block, idx) => {
    if (block.type === "equal") {
      staticTokens.push(...block.tokens);
      parts.push(block.tokens.map(escapeRegex).join("\\s+"));
    } else {
      const group = `v${slotIndex++}`;
      const samples: [string, string] = [block.a.join(" "), block.b.join(" ")];
      const isLast = idx === blocks.length - 1;
      // Lazy between anchors; greedy when trailing with no anchor after it.
      parts.push(`(?<${group}>.+${isLast ? "" : "?"})`);
      slots.push({ group, role: classify(samples), samples });
    }
  });

  const pattern = parts.join("\\s+");
  const amountSlot = slots.find((s) => s.role === "amount");
  const dateSlot = slots.find((s) => s.role === "date");
  const noteSlot = slots.find((s) => s.role === "note");

  const staticText = staticTokens.join(" ");
  const identifierCandidates = detectIdentifiers(staticText);
  const currency =
    CURRENCY_RE.exec(staticText)?.[1] ??
    (amountSlot ? CURRENCY_RE.exec(amountSlot.samples.join(" "))?.[1] : undefined) ??
    undefined;
  const { direction, rules } = detectDirection(messageA);

  return {
    pattern,
    slots,
    amountGroup: amountSlot?.group,
    dateGroup: dateSlot?.group,
    noteGroup: noteSlot?.group,
    currency,
    identifier: identifierCandidates[0],
    identifierCandidates,
    direction,
    directionRules: rules,
  };
}
