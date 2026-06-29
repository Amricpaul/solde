import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user.model";

const KEY_PREFIX = "solde_";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Mint a new raw key plus the hash/last4 we persist. The raw key is shown once. */
export function generateApiKey(): { raw: string; hash: string; last4: string } {
  const raw = KEY_PREFIX + randomBytes(32).toString("base64url");
  return { raw, hash: sha256(raw), last4: raw.slice(-4) };
}

/** SHA-256 of a presented key — used to look up the owning user. */
export function hashApiKey(raw: string): string {
  return sha256(raw);
}

/** Extract the token from an `Authorization: Bearer <key>` header. */
export function bearerFromRequest(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || undefined;
}

/**
 * Resolve the user id behind a request's bearer API key, or null if absent/invalid.
 * Lookup is by hash, so the raw key is never compared directly.
 */
export async function userIdFromApiKey(request: Request): Promise<string | null> {
  const raw = bearerFromRequest(request);
  if (!raw) return null;
  await connectDB();
  const user = await User.findOne({ apiKeyHash: hashApiKey(raw) }).select("_id").lean();
  return user?._id.toString() ?? null;
}
