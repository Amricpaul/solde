import { SignJWT, jwtVerify } from "jose";

// Pure JWT helpers (jose only) — no next/headers, no "server-only" — so this is
// safe to import from proxy.ts as well as Server Components / Route Handlers.

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET is not set. Generate one with `openssl rand -base64 32`.");
}

const secret = new TextEncoder().encode(AUTH_SECRET);

export interface SessionPayload {
  userId: string;
  expiresAt: number;
  [key: string]: unknown;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
