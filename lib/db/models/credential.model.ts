import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// One document per registered passkey (WebAuthn authenticator).
// Field set matches what @simplewebauthn/server v13 needs to verify an
// authentication response: { id, publicKey, counter, transports }.
const credentialSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Base64URL credential id, as returned by verifyRegistrationResponse
    // (registrationInfo.credential.id). Unique per authenticator.
    credentialID: { type: String, required: true, unique: true, index: true },
    // The COSE public key bytes (Uint8Array) stored as a Buffer.
    publicKey: { type: Buffer, required: true },
    // Signature counter; bumped after each successful authentication (replay guard).
    counter: { type: Number, required: true, default: 0 },
    // AuthenticatorTransportFuture[] e.g. ["internal", "hybrid"].
    transports: { type: [String], default: undefined },
    // credentialDeviceType: "singleDevice" | "multiDevice".
    deviceType: { type: String },
    backedUp: { type: Boolean },
  },
  { timestamps: true },
);

export type CredentialDoc = InferSchemaType<typeof credentialSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Credential: Model<CredentialDoc> =
  (mongoose.models.Credential as Model<CredentialDoc>) ??
  mongoose.model<CredentialDoc>("Credential", credentialSchema);
