// Shared (server + client safe) parsing of transaction-history filters.
// URL params: q (note search), type, account, category. The category value
// "none" is a sentinel meaning "uncategorized".

export const UNCATEGORIZED = "none";

export interface TransactionFilters {
  q?: string;
  type?: "income" | "expense";
  accountId?: string;
  /** A category id, or UNCATEGORIZED for transactions with no category. */
  categoryId?: string;
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseTransactionFilters(params: RawParams): TransactionFilters {
  const filters: TransactionFilters = {};

  const q = first(params.q)?.trim();
  if (q) filters.q = q;

  const type = first(params.type);
  if (type === "income" || type === "expense") filters.type = type;

  const account = first(params.account)?.trim();
  if (account) filters.accountId = account;

  const category = first(params.category)?.trim();
  if (category) filters.categoryId = category;

  return filters;
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return Boolean(filters.q || filters.type || filters.accountId || filters.categoryId);
}
