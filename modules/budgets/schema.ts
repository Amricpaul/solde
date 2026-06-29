import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.string().trim().min(1, "Choose a category"),
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
