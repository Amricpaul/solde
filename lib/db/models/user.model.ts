import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    // Optional: passkey-only users may never set a password.
    passwordHash: { type: String },
    // ISO-4217 currency code. Default aligns with the product's primary market.
    baseCurrency: { type: String, default: "AED", uppercase: true },
    // Personal API key for non-interactive clients (e.g. the Apple Shortcut SMS
    // importer). Only the SHA-256 hash is stored; the raw key is shown once.
    apiKeyHash: { type: String, index: true },
    apiKeyLast4: { type: String }, // for display, e.g. "a1b2"
    apiKeyCreatedAt: { type: Date },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

// Guard against OverwriteModelError when this module is re-evaluated on hot-reload.
export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) ?? mongoose.model<UserDoc>("User", userSchema);
