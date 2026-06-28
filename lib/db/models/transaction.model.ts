import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const TRANSACTION_TYPES = ["income", "expense"] as const;
export const TRANSACTION_SOURCES = ["manual", "shortcut", "import"] as const;

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" }, // optional / uncategorized
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amountMinor: { type: Number, required: true }, // integer minor units, always positive
    currency: { type: String, required: true, uppercase: true },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
    // Future-proofing for automated ingestion (e.g. Apple Shortcut).
    source: { type: String, enum: TRANSACTION_SOURCES, required: true, default: "manual" },
    externalId: { type: String }, // idempotency key for imported/automated entries
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1 });
// De-dupe automated inserts per user without blocking manual ones (externalId is sparse).
transactionSchema.index(
  { userId: 1, externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $type: "string" } } },
);

export type TransactionDoc = InferSchemaType<typeof transactionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Transaction: Model<TransactionDoc> =
  (mongoose.models.Transaction as Model<TransactionDoc>) ??
  mongoose.model<TransactionDoc>("Transaction", transactionSchema);
