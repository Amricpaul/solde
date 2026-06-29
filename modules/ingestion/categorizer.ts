import "server-only";

import { connectDB } from "@/lib/db/connect";
import { MerchantCategory } from "@/lib/db/models/merchant-category.model";
import { classifyMerchant } from "@/lib/ai/categorizer-llm";
import { listCategories } from "@/modules/categories/service";

export interface Categorized {
  categoryId: string;
  categoryName: string;
}

/** Reduce a raw merchant/note to a stable cache key (strips dates, refs, punctuation). */
export function normalizeMerchant(note: string): string {
  return note
    .toUpperCase()
    .replace(/\b\d[\d/:.-]{2,}\b/g, " ") // dates, times, ref numbers
    .replace(/[^A-Z0-9 &.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/** Cache a merchant→category mapping. Manual entries win over AI ones. */
export async function rememberMerchant(
  userId: string,
  note: string,
  categoryId: string,
  source: "ai" | "manual",
): Promise<void> {
  const keyword = normalizeMerchant(note);
  if (!keyword) return;
  await connectDB();
  try {
    await MerchantCategory.updateOne(
      { userId, keyword },
      { $set: { categoryId, source } },
      { upsert: true },
    );
  } catch {
    // Unique race or transient error — categorization is best-effort.
  }
}

/**
 * Resolve a category for a merchant: cache first, then the LLM (writing the
 * result back to the cache). Returns null on empty input, no match, or any error.
 */
export async function categorize(
  userId: string,
  note: string | undefined,
  type: "income" | "expense",
): Promise<Categorized | null> {
  if (!note) return null;
  const keyword = normalizeMerchant(note);
  if (!keyword) return null;

  try {
    await connectDB();
    const categories = await listCategories(userId);
    const byId = new Map(categories.map((c) => [c.id, c.name]));

    // 1. Cache hit (ignore if the cached category was since deleted).
    const cached = await MerchantCategory.findOne({ userId, keyword }).select("categoryId").lean();
    if (cached) {
      const id = cached.categoryId.toString();
      const name = byId.get(id);
      if (name) return { categoryId: id, categoryName: name };
    }

    // 2. Miss → LLM, constrained to same-type categories.
    const candidates = categories.filter((c) => c.type === type).map((c) => ({ id: c.id, name: c.name }));
    const { categoryId } = await classifyMerchant({ merchant: note, candidates });
    if (!categoryId) return null;

    const name = byId.get(categoryId);
    if (!name) return null;

    await rememberMerchant(userId, note, categoryId, "ai");
    return { categoryId, categoryName: name };
  } catch {
    return null;
  }
}
