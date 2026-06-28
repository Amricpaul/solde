import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// One short-lived password-reset token per request. We store only the SHA-256
// hash of the token, never the raw value.
const passwordResetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL index: MongoDB removes documents once `expiresAt` passes.
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetDoc = InferSchemaType<typeof passwordResetSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PasswordReset: Model<PasswordResetDoc> =
  (mongoose.models.PasswordReset as Model<PasswordResetDoc>) ??
  mongoose.model<PasswordResetDoc>("PasswordReset", passwordResetSchema);
