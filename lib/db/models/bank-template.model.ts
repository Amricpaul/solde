import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// A learned parser for one bank/card's SMS alerts. Built by diffing two sample
// messages: the static text becomes `pattern`, the variable slots are labelled,
// and the stable account token (`identifier`) maps the message to one account.
const bankTemplateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true, trim: true }, // e.g. "ADCB Credit"
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    senderMatch: { type: String, required: true, trim: true }, // SMS sender / shortcode
    identifier: { type: String, trim: true }, // stable token that pins this card, e.g. "1234"
    pattern: { type: String, required: true }, // RegExp source with named groups
    slots: {
      // Named capture group → role. amount is required; others optional.
      amount: { type: String, required: true },
      date: { type: String },
      note: { type: String },
    },
    currency: { type: String, required: true, uppercase: true },
    direction: { type: String, enum: ["income", "expense"], required: true, default: "expense" },
    directionRules: {
      income: { type: [String], default: [] },
      expense: { type: [String], default: [] },
    },
  },
  { timestamps: true },
);

bankTemplateSchema.index({ userId: 1 });

export type BankTemplateDoc = InferSchemaType<typeof bankTemplateSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BankTemplate: Model<BankTemplateDoc> =
  (mongoose.models.BankTemplate as Model<BankTemplateDoc>) ??
  mongoose.model<BankTemplateDoc>("BankTemplate", bankTemplateSchema);
