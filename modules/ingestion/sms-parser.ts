// Apply a learned BankTemplate to a raw SMS to extract a transaction. Pure, no DB.

export class UnknownBankError extends Error {
  constructor() {
    super("No bank template matches this sender");
    this.name = "UnknownBankError";
  }
}

export class UnparseableSmsError extends Error {
  constructor() {
    super("Message did not match the bank's template");
    this.name = "UnparseableSmsError";
  }
}

/** The subset of a BankTemplate the parser needs. */
export interface ParserTemplate {
  id: string;
  accountId: string;
  senderMatch: string;
  identifier?: string;
  pattern: string;
  slots: { amount: string; date?: string; note?: string };
  currency: string;
  direction: "income" | "expense";
  directionRules: { income: string[]; expense: string[] };
}

export interface ParsedSms {
  amount: number;
  currency: string;
  type: "income" | "expense";
  note?: string;
  date?: Date;
  accountId: string;
  templateId: string;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseAmount(raw: string | undefined): number {
  if (!raw) return NaN;
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  return Number.parseFloat(cleaned);
}

function parseDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const s = raw.trim();
  // dd/mm/yyyy or dd-mm-yyyy (assume day-first, the GCC/EU convention)
  let m = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/.exec(s);
  if (m) {
    const day = +m[1];
    const month = +m[2] - 1;
    const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    const d = new Date(year, month, day);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  // dd Mon yyyy  /  dd-Mon-yy
  m = /(\d{1,2})[-\s]([A-Za-z]{3})[A-Za-z]*[-\s]?(\d{2,4})?/.exec(s);
  if (m) {
    const month = MONTHS[m[2].toLowerCase()];
    if (month != null) {
      const year = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : new Date().getFullYear();
      const d = new Date(year, month, +m[1]);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }
  }
  // ISO
  m = /\d{4}-\d{2}-\d{2}/.exec(s);
  if (m) {
    const d = new Date(m[0]);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

function senderMatches(template: ParserTemplate, sender: string, message: string): boolean {
  const needle = template.senderMatch.toLowerCase();
  return sender.toLowerCase().includes(needle) || message.toLowerCase().includes(needle);
}

export function parseSms(
  templates: ParserTemplate[],
  message: string,
  sender: string,
): ParsedSms {
  const candidates = templates.filter((t) => senderMatches(t, sender, message));
  if (candidates.length === 0) throw new UnknownBankError();

  // Disambiguate multiple cards at one bank by which identifier appears in the text.
  const template =
    candidates.find((t) => t.identifier && message.includes(t.identifier)) ?? candidates[0];

  let groups: Record<string, string | undefined>;
  try {
    groups = new RegExp(template.pattern).exec(message.trim())?.groups ?? {};
  } catch {
    throw new UnparseableSmsError();
  }

  const amount = parseAmount(groups[template.slots.amount]);
  if (!Number.isFinite(amount) || amount <= 0) throw new UnparseableSmsError();

  const note = template.slots.note ? groups[template.slots.note]?.trim() || undefined : undefined;
  const date = template.slots.date ? parseDate(groups[template.slots.date]) : undefined;

  // Direction: keyword scan can flip the template default.
  const lower = message.toLowerCase();
  const inc = template.directionRules.income.some((k) => lower.includes(k.toLowerCase()));
  const exp = template.directionRules.expense.some((k) => lower.includes(k.toLowerCase()));
  let type = template.direction;
  if (inc && !exp) type = "income";
  else if (exp && !inc) type = "expense";

  return {
    amount,
    currency: template.currency,
    type,
    note,
    date,
    accountId: template.accountId,
    templateId: template.id,
  };
}
