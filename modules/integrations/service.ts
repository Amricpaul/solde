import "server-only";

import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user.model";
import { generateApiKey } from "@/lib/auth/api-key";

export interface ApiKeyStatus {
  last4: string;
  createdAt: string; // ISO
}

export async function getApiKeyStatus(userId: string): Promise<ApiKeyStatus | null> {
  await connectDB();
  const user = await User.findById(userId).select("apiKeyHash apiKeyLast4 apiKeyCreatedAt").lean();
  if (!user?.apiKeyHash || !user.apiKeyLast4 || !user.apiKeyCreatedAt) return null;
  return { last4: user.apiKeyLast4, createdAt: (user.apiKeyCreatedAt as Date).toISOString() };
}

/** Generate a fresh key (replacing any existing one) and return the raw value once. */
export async function rotateApiKey(userId: string): Promise<string> {
  await connectDB();
  const { raw, hash, last4 } = generateApiKey();
  await User.updateOne(
    { _id: userId },
    { $set: { apiKeyHash: hash, apiKeyLast4: last4, apiKeyCreatedAt: new Date() } },
  );
  return raw;
}

export async function revokeApiKey(userId: string): Promise<void> {
  await connectDB();
  await User.updateOne(
    { _id: userId },
    { $unset: { apiKeyHash: "", apiKeyLast4: "", apiKeyCreatedAt: "" } },
  );
}
