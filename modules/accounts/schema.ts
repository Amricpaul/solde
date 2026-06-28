import { z } from "zod";

import { ACCOUNT_TYPES } from "@/lib/db/models/account.model";

const emptyToUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);

const optionalDay = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(1).max(31).optional(),
);

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(ACCOUNT_TYPES),
  currency: z.string().trim().toUpperCase().length(3, "Use a 3-letter currency code"),
  last4: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Enter the last 4 digits")
    .optional()
    .or(z.literal("")),
  institution: z.string().trim().max(80).optional().or(z.literal("")),
  openingBalance: z.coerce.number().min(0, "Cannot be negative").default(0),
  // Credit-card specifics (ignored for non-credit accounts).
  creditLimit: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  statementDay: optionalDay,
  paymentDueDay: optionalDay,
});

export type AccountInput = z.infer<typeof accountSchema>;
