import { z } from "zod";

import { CATEGORY_TYPES } from "@/lib/db/models/category.model";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  type: z.enum(CATEGORY_TYPES),
  icon: z.string().trim().optional().or(z.literal("")),
  color: z.string().trim().optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
