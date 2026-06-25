"use client";

import {
  startAuthentication,
  startRegistration,
  WebAuthnError,
} from "@simplewebauthn/browser";

async function postJSON(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data;
}

/** Enroll a new passkey for the currently logged-in user. */
export async function registerPasskey(): Promise<void> {
  const optionsJSON = await postJSON("/api/auth/passkey/register/options");
  let attResp;
  try {
    attResp = await startRegistration({ optionsJSON });
  } catch (err) {
    if (err instanceof WebAuthnError) throw new Error(err.message);
    throw err;
  }
  await postJSON("/api/auth/passkey/register/verify", attResp);
}

/** Authenticate with a passkey. `email` is optional (usernameless if omitted). */
export async function signInWithPasskey(email?: string): Promise<void> {
  const optionsJSON = await postJSON("/api/auth/passkey/authenticate/options", { email });
  let authResp;
  try {
    authResp = await startAuthentication({ optionsJSON });
  } catch (err) {
    if (err instanceof WebAuthnError) throw new Error(err.message);
    throw err;
  }
  await postJSON("/api/auth/passkey/authenticate/verify", authResp);
}
