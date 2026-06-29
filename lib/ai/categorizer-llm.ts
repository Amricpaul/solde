import "server-only";

import { z } from "zod";

// Provider-thin merchant classifier. One function so the provider is swappable;
// currently OpenAI via fetch. Returns null (no-op) when unconfigured or unsure —
// categorization must never break ingestion.

export interface Candidate {
  id: string;
  name: string;
}

const responseSchema = z.object({ categoryId: z.string().nullable() });

export async function classifyMerchant({
  merchant,
  candidates,
}: {
  merchant: string;
  candidates: Candidate[];
}): Promise<{ categoryId: string | null }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || candidates.length === 0 || !merchant.trim()) return { categoryId: null };

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const list = candidates.map((c) => `- ${c.id}: ${c.name}`).join("\n");
  const system =
    'You categorize a bank-transaction merchant into exactly one of the user\'s categories. ' +
    'Reply with strict JSON {"categoryId":"<id>"} using one of the provided ids, ' +
    'or {"categoryId":null} if none clearly fit.';
  const user = `Merchant/description: "${merchant}"\nCategories:\n${list}`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return { categoryId: null };

    const data = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") return { categoryId: null };

    const parsed = responseSchema.safeParse(JSON.parse(content));
    if (!parsed.success) return { categoryId: null };

    const id = parsed.data.categoryId;
    return id && candidates.some((c) => c.id === id) ? { categoryId: id } : { categoryId: null };
  } catch {
    return { categoryId: null };
  }
}
