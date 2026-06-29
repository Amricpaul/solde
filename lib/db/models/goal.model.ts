import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// A saving-goal bucket: a named target you grow toward by contributing funds.
// `savedMinor` is the manual running balance set aside for this goal.
const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    targetMinor: { type: Number, required: true }, // target amount, integer minor units
    savedMinor: { type: Number, required: true, default: 0 }, // amount set aside, >= 0
    currency: { type: String, required: true, uppercase: true },
    color: { type: String }, // hex accent for the card
    targetDate: { type: Date }, // optional deadline
  },
  { timestamps: true },
);

goalSchema.index({ userId: 1, createdAt: 1 });

export type GoalDoc = InferSchemaType<typeof goalSchema> & { _id: mongoose.Types.ObjectId };

export const Goal: Model<GoalDoc> =
  (mongoose.models.Goal as Model<GoalDoc>) ?? mongoose.model<GoalDoc>("Goal", goalSchema);
