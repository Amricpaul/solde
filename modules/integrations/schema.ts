import { z } from "zod";

/** Fields persisted for a learned bank SMS template (from the onboarding form). */
export const bankTemplateInput = z.object({
  label: z.string().trim().min(1, "Name this bank").max(60),
  accountId: z.string().trim().min(1, "Choose an account"),
  senderMatch: z.string().trim().min(1, "Sender is required").max(64),
  identifier: z.string().trim().max(40).optional().or(z.literal("")),
  currency: z.string().trim().min(3, "3-letter code").max(3),
  direction: z.enum(["income", "expense"]),
  pattern: z.string().min(1),
  amountGroup: z.string().min(1),
  dateGroup: z.string().optional().or(z.literal("")),
  noteGroup: z.string().optional().or(z.literal("")),
  directionRules: z.string().optional(), // JSON: { income: string[], expense: string[] }
});

export type BankTemplateInput = z.infer<typeof bankTemplateInput>;
