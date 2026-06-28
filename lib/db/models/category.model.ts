import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const CATEGORY_TYPES = ["income", "expense"] as const;

const categorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: CATEGORY_TYPES, required: true },
    icon: { type: String }, // lucide icon name
    color: { type: String }, // hex
  },
  { timestamps: true },
);

categorySchema.index({ userId: 1, type: 1 });

export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: mongoose.Types.ObjectId };

export const Category: Model<CategoryDoc> =
  (mongoose.models.Category as Model<CategoryDoc>) ??
  mongoose.model<CategoryDoc>("Category", categorySchema);
