// Money is stored as integer minor units (cents/fils) + an ISO-4217 currency.
// These helpers are pure and safe to import on the client or server.

// Currencies whose minor unit is not 2 decimals. Default is 2.
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP", "ISK", "XOF", "XAF"]);
const THREE_DECIMAL = new Set(["KWD", "BHD", "OMR", "TND", "IQD", "JOD", "LYD"]);

export function minorUnitDigits(currency: string): number {
  const c = currency.toUpperCase();
  if (ZERO_DECIMAL.has(c)) return 0;
  if (THREE_DECIMAL.has(c)) return 3;
  return 2;
}

/** Convert a major-unit amount (e.g. 12.34) to integer minor units (1234). */
export function toMinor(amount: number, currency: string): number {
  const factor = 10 ** minorUnitDigits(currency);
  return Math.round(amount * factor);
}

/** Convert integer minor units back to a major-unit number. */
export function fromMinor(amountMinor: number, currency: string): number {
  return amountMinor / 10 ** minorUnitDigits(currency);
}

/** Format minor units as a localized currency string, e.g. "AED 1,250.00". */
export function formatMoney(amountMinor: number, currency: string): string {
  const digits = minorUnitDigits(currency);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(fromMinor(amountMinor, currency));
  } catch {
    // Unknown currency code — fall back to a plain number + code.
    return `${fromMinor(amountMinor, currency).toFixed(digits)} ${currency.toUpperCase()}`;
  }
}

/** Signed display, e.g. "+ AED 1,250.00" / "- AED 42.80". */
export function formatSigned(amountMinor: number, currency: string, type: "income" | "expense"): string {
  const sign = type === "income" ? "+" : "-";
  return `${sign} ${formatMoney(Math.abs(amountMinor), currency)}`;
}
