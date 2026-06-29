import { z } from "zod";

/** Payload the Apple Shortcut POSTs: the raw bank SMS plus its sender. */
export const ingestRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  sender: z.string().trim().min(1).max(64),
  // Optional override; normally the date is parsed from the message itself.
  receivedAt: z.coerce.date().optional(),
});

export type IngestRequest = z.infer<typeof ingestRequestSchema>;
