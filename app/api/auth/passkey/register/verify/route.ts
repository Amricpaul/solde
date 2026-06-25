import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";

import { getCurrentUser } from "@/lib/auth/dal";
import { clearChallenge, getChallenge, origin, rpID } from "@/lib/auth/webauthn";
import { connectDB } from "@/lib/db/connect";
import { Credential } from "@/lib/db/models/credential.model";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const expectedChallenge = await getChallenge();
  if (!expectedChallenge) {
    return Response.json({ error: "Challenge expired, try again" }, { status: 400 });
  }

  const body = (await request.json()) as RegistrationResponseJSON;

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch {
    await clearChallenge();
    return Response.json({ error: "Could not verify passkey" }, { status: 400 });
  }

  await clearChallenge();

  if (!verification.verified || !verification.registrationInfo) {
    return Response.json({ verified: false }, { status: 400 });
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  await connectDB();
  await Credential.create({
    userId: user.id,
    credentialID: credential.id,
    publicKey: Buffer.from(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports ?? body.response.transports,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
  });

  return Response.json({ verified: true });
}
