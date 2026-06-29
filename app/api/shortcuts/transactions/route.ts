import { userIdFromApiKey } from "@/lib/auth/api-key";
import { AccountNotFoundError } from "@/modules/transactions/service";
import { ingestRequestSchema } from "@/modules/ingestion/schema";
import { ingestTransaction } from "@/modules/ingestion/service";
import { UnknownBankError, UnparseableSmsError } from "@/modules/ingestion/sms-parser";

/**
 * POST /api/shortcuts/transactions
 * Bearer-authed ingestion for the Apple Shortcut SMS importer.
 * Body: { message, sender, receivedAt? }
 */
export async function POST(request: Request): Promise<Response> {
  const userId = await userIdFromApiKey(request);
  if (!userId) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ingestRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const result = await ingestTransaction(userId, parsed.data);
    return Response.json({ ok: true, deduped: result.deduped, transaction: result });
  } catch (err) {
    if (err instanceof UnknownBankError) {
      return Response.json(
        {
          ok: false,
          error: "Unknown bank. Add it under Settings → SMS import.",
          sender: parsed.data.sender,
        },
        { status: 422 },
      );
    }
    if (err instanceof UnparseableSmsError) {
      return Response.json(
        { ok: false, error: "Could not parse this message.", sender: parsed.data.sender },
        { status: 422 },
      );
    }
    if (err instanceof AccountNotFoundError) {
      return Response.json(
        { ok: false, error: "Mapped account no longer exists." },
        { status: 422 },
      );
    }
    throw err;
  }
}
