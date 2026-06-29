import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().trim().min(1, "Name your goal").max(60),
  targetAmount: z.coerce.number().positive("Enter a target greater than 0"),
  targetDate: z.coerce.date().optional(),
  color: z.string().trim().optional().or(z.literal("")),
});

export type GoalInput = z.infer<typeof goalSchema>;

export const contributeSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  direction: z.enum(["add", "withdraw"]),
});

export type ContributeInput = z.infer<typeof contributeSchema>;
