import "server-only";

import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user.model";
import type { LoginInput, RegisterInput } from "./schema";

const BCRYPT_COST = 12;

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
