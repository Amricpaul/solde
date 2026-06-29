import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// A learned merchant→category mapping ("keyword table"). Populated by the AI
// categorizer on a cache miss and by the user's own manual re-categorizations,
// so repeat merchants are categorized for free without another model call.
const merchantCategorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    keyword: { type: String, required: true, trim: true }, // normalized merchant string
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    source: { type: String, enum: ["ai", "manual"], required: true, default: "ai" },
  },
  { timestamps: true },
);

merchantCategorySchema.index({ userId: 1, keyword: 1 }, { unique: true });

export type MerchantCategoryDoc = InferSchemaType<typeof merchantCategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MerchantCategory: Model<MerchantCategoryDoc> =
  (mongoose.models.MerchantCategory as Model<MerchantCategoryDoc>) ??
  mongoose.model<MerchantCategoryDoc>("MerchantCategory", merchantCategorySchema);
