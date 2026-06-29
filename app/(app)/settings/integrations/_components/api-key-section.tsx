"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { rotateApiKeyAction, revokeApiKeyAction } from "@/modules/integrations/actions";

export interface ApiKeyStatusView {
  last4: string;
  createdAt: string; // ISO
}

export function ApiKeySection({ status }: { status: ApiKeyStatusView | null }) {
  const [pending, startTransition] = useTransition();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function rotate() {
    startTransition(async () => {
      const res = await rotateApiKeyAction();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setRevealed(res.key ?? null);
      toast.success("New key generated. Copy it now — it won't be shown again.");
    });
  }

  function revoke() {
    startTransition(async () => {
      await revokeApiKeyAction();
      setRevealed(null);
      toast.success("API key revoked.");
    });
  }

  async function copy() {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
          <KeyRound className="size-[1.1rem]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">API key</p>
          <p className="truncate text-sm text-muted-foreground">
            {status
              ? `Active · ends …${status.last4} · created ${new Date(status.createdAt).toLocaleDateString()}`
              : "No key yet — generate one to use the Shortcut."}
          </p>
        </div>
      </div>

      {revealed ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Copy this now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs">
              {revealed}
            </code>
            <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copy key">
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={rotate} disabled={pending}>
          <RefreshCw className="size-4" />
          {status ? "Rotate key" : "Generate key"}
        </Button>
        {status ? (
          <Button
            type="button"
            variant="ghost"
            onClick={revoke}
            disabled={pending}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Revoke
          </Button>
        ) : null}
      </div>
    </div>
  );
}
