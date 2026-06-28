import { z } from "zod";

import { TRANSACTION_TYPES } from "@/lib/db/models/transaction.model";

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  accountId: z.string().trim().min(1, "Choose an account"),
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  categoryId: z.string().trim().optional().or(z.literal("")),
  date: z.coerce.date().optional(),
  note: z.string().trim().max(140).optional().or(z.literal("")),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
