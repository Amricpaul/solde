import "server-only";

import { cookies } from "next/headers";

import { signSession, verifySession, type SessionPayload } from "./jwt";

export type { SessionPayload } from "./jwt";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/** Issued by BOTH password login and passkey login — the one place a session is minted. */
export async function createSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const token = await signSession({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Must be false over http://localhost or the browser silently drops the cookie.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
