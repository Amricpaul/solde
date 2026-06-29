import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// A per-category monthly spending limit. The limit recurs every month; spend is
// computed from that category's expense transactions in the current month.
const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    amountMinor: { type: Number, required: true }, // monthly limit, integer minor units, positive
    currency: { type: String, required: true, uppercase: true },
  },
  { timestamps: true },
);

// One budget per category per user.
budgetSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

export type BudgetDoc = InferSchemaType<typeof budgetSchema> & { _id: mongoose.Types.ObjectId };

export const Budget: Model<BudgetDoc> =
  (mongoose.models.Budget as Model<BudgetDoc>) ??
  mongoose.model<BudgetDoc>("Budget", budgetSchema);
