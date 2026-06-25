import { generateRegistrationOptions } from "@simplewebauthn/server";

import { getCurrentUser } from "@/lib/auth/dal";
import { rpID, rpName, setChallenge } from "@/lib/auth/webauthn";
import { connectDB } from "@/lib/db/connect";
import { Credential } from "@/lib/db/models/credential.model";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const existing = await Credential.find({ userId: user.id })
    .select("credentialID transports")
    .lean();

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email,
    userDisplayName: user.name,
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({
      id: c.credentialID,
      transports: c.transports as AuthenticatorTransport[] | undefined,
    })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });

  await setChallenge(options.challenge);
  return Response.json(options);
}
