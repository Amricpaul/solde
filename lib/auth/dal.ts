import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user.model";
import { getSession } from "./session";

/** Shape safe to pass to components — never includes passwordHash. */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  baseCurrency: string;
}

/**
 * Memoized per request so multiple Server Components / Actions in one render
 * share a single session decode + DB read. Reads the session cookie, so any
 * caller is rendered dynamically. Do NOT call from the root layout.
 */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const session = await getSession();
  if (!session?.userId) return null;

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    baseCurrency: user.baseCurrency ?? "AED",
  };
});

/** Use in protected pages/actions/handlers — redirects to /login when unauthenticated. */
export const requireUser = cache(async (): Promise<SafeUser> => {
  const user = await getCurrentUser();
  if (user) return user;

  // No user resolved. If a session cookie is still present, the token is valid
  // but the user is gone (deleted / DB reset) — the proxy treats that cookie as
  // authed, so redirecting to /login would loop (the proxy bounces it back to /).
  // Route through the logout handler instead, which clears the cookie first.
  const session = await getSession();
  redirect(session?.userId ? "/api/auth/logout" : "/login");
});
