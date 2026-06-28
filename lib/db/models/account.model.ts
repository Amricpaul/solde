import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ACCOUNT_TYPES = ["bank", "credit_card", "debit_card", "cash", "other"] as const;

const accountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ACCOUNT_TYPES, required: true, default: "bank" },
    currency: { type: String, required: true, uppercase: true, default: "AED" },
    last4: { type: String }, // last 4 digits for cards
    institution: { type: String, trim: true }, // bank / issuer name
    color: { type: String }, // hex for the card UI
    // Starting balance in integer minor units; the live balance derives from transactions.
    // For credit cards this is the amount currently owed.
    openingBalanceMinor: { type: Number, required: true, default: 0 },
    // Credit-card specifics (only set when type === "credit_card").
    creditLimitMinor: { type: Number }, // total credit limit
    statementDay: { type: Number }, // day of month the statement closes (1–31)
    paymentDueDay: { type: Number }, // day of month payment is due (1–31)
    archived: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

accountSchema.index({ userId: 1, archived: 1 });

export type AccountDoc = InferSchemaType<typeof accountSchema> & { _id: mongoose.Types.ObjectId };

export const Account: Model<AccountDoc> =
  (mongoose.models.Account as Model<AccountDoc>) ??
  mongoose.model<AccountDoc>("Account", accountSchema);
