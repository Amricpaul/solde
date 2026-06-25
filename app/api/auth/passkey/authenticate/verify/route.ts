import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from "@simplewebauthn/server";

import { createSession } from "@/lib/auth/session";
import { clearChallenge, getChallenge, origin, rpID } from "@/lib/auth/webauthn";
import { connectDB } from "@/lib/db/connect";
import { Credential } from "@/lib/db/models/credential.model";

export async function POST(request: Request) {
  const expectedChallenge = await getChallenge();
  if (!expectedChallenge) {
    return Response.json({ error: "Challenge expired, try again" }, { status: 400 });
  }

  const body = (await request.json()) as AuthenticationResponseJSON;

  await connectDB();
  const cred = await Credential.findOne({ credentialID: body.id });
  if (!cred) {
    await clearChallenge();
    return Response.json({ error: "Unknown passkey" }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: cred.credentialID,
        publicKey: new Uint8Array(cred.publicKey),
        counter: cred.counter,
        transports: cred.transports as AuthenticatorTransportFuture[] | undefined,
      },
    });
  } catch {
    await clearChallenge();
    return Response.json({ error: "Could not verify passkey" }, { status: 400 });
  }

  await clearChallenge();

  if (!verification.verified) {
    return Response.json({ verified: false }, { status: 400 });
  }

  // Persist the new signature counter (replay protection).
  cred.counter = verification.authenticationInfo.newCounter;
  await cred.save();

  // Same session cookie as password login.
  await createSession(cred.userId.toString());

  return Response.json({ verified: true });
}
