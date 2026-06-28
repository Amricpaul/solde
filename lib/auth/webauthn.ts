import "server-only";

import { cookies } from "next/headers";

import { normalizeAppUrl } from "@/lib/utils";

import { signSession, verifySession } from "./jwt";

if (!process.env.APP_URL) {
  throw new Error("APP_URL is not set. It is required to derive the WebAuthn origin/rpID.");
}

// Vercel exposes the deployment host without a scheme; normalize so new URL() parses.
const APP_URL = normalizeAppUrl(process.env.APP_URL);

/** Relying Party config — derived from APP_URL so there's a single source of truth. */
export const origin = APP_URL;
export const rpID = new URL(APP_URL).hostname; // "localhost" in dev
export const rpName = process.env.APP_NAME?.replace(/^"|"$/g, "") || "Solde";

const CHALLENGE_COOKIE = "webauthn_chal";
const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// The challenge must survive exactly one round-trip (options -> verify) and be
// single-use. We store it in a short-lived, signed, httpOnly cookie (reusing the
// jose secret) rather than the DB: it self-expires, needs no cleanup job, and
// works for usernameless authentication where there's no user record yet.

export async function setChallenge(challenge: string): Promise<void> {
  const token = await signSession({
    userId: "webauthn", // unused marker; payload type requires the field
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
    challenge,
  });
  const cookieStore = await cookies();
  cookieStore.set(CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CHALLENGE_TTL_MS / 1000,
  });
}

export async function getChallenge(): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = await verifySession(cookieStore.get(CHALLENGE_COOKIE)?.value);
  const challenge = payload?.challenge;
  return typeof challenge === "string" ? challenge : null;
}

export async function clearChallenge(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CHALLENGE_COOKIE);
}
