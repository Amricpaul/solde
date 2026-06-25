import { generateAuthenticationOptions } from "@simplewebauthn/server";

import { rpID, setChallenge } from "@/lib/auth/webauthn";
import { connectDB } from "@/lib/db/connect";
import { Credential } from "@/lib/db/models/credential.model";
import { User } from "@/lib/db/models/user.model";

export async function POST(request: Request) {
  // Optional email narrows allowCredentials; omitting it allows usernameless
  // (discoverable-credential) login where the authenticator picks the passkey.
  let email: string | undefined;
  try {
    email = (await request.json())?.email?.toString().trim().toLowerCase();
  } catch {
    email = undefined;
  }

  let allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] | undefined;

  if (email) {
    await connectDB();
    const user = await User.findOne({ email }).select("_id").lean();
    if (user) {
      const creds = await Credential.find({ userId: user._id })
        .select("credentialID transports")
        .lean();
      allowCredentials = creds.map((c) => ({
        id: c.credentialID,
        transports: c.transports as AuthenticatorTransport[] | undefined,
      }));
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: "preferred",
  });

  await setChallenge(options.challenge);
  return Response.json(options);
}
