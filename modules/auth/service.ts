import "server-only";

import { createHash, randomBytes } from "crypto";

import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user.model";
import { PasswordReset } from "@/lib/db/models/password-reset.model";
import type { LoginInput, RegisterInput } from "./schema";

const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Raised when registering an email that already exists. */
export class EmailInUseError extends Error {
  constructor() {
    super("Email already in use");
    this.name = "EmailInUseError";
  }
}

export async function createUser({ name, email, password }: RegisterInput): Promise<string> {
  await connectDB();

  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing) throw new EmailInUseError();

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = await User.create({ name, email, passwordHash });
  return user._id.toString();
}

/** Returns the user id on success, or null for an unknown email / wrong password. */
export async function verifyPassword({ email, password }: LoginInput): Promise<string | null> {
  await connectDB();

  const user = await User.findOne({ email }).select("_id passwordHash").lean();
  if (!user?.passwordHash) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user._id.toString() : null;
}

/**
 * Creates a single-use reset token for the email — but only if a user exists.
 * Returns the RAW token (for the email link), or null when no account matches.
 * Callers must respond identically either way so account existence isn't leaked.
 */
export async function createPasswordResetToken(
  email: string,
): Promise<{ token: string; name: string } | null> {
  await connectDB();

  const user = await User.findOne({ email }).select("_id name").lean();
  if (!user) return null;

  const token = randomBytes(32).toString("hex");
  await PasswordReset.deleteMany({ userId: user._id }); // invalidate older tokens
  await PasswordReset.create({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  return { token, name: user.name };
}

/** Sets a new password if the token is valid and unexpired. Returns success. */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  await connectDB();

  const reset = await PasswordReset.findOne({ tokenHash: hashToken(token) });
  if (!reset) return false;

  if (reset.expiresAt.getTime() < Date.now()) {
    await PasswordReset.deleteOne({ _id: reset._id });
    return false;
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
  await User.updateOne({ _id: reset.userId }, { $set: { passwordHash } });
  await PasswordReset.deleteMany({ userId: reset.userId }); // single-use
  return true;
}
