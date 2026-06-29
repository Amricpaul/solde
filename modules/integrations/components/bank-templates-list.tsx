import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteBankTemplateAction } from "@/modules/integrations/actions";
import type { SafeBankTemplate } from "@/modules/integrations/bank-service";

export function BankTemplatesList({ templates }: { templates: SafeBankTemplate[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-sm font-medium text-muted-foreground">Banks</h2>
        <Link
          href="/settings/integrations/banks/new"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
        >
          <Plus className="size-4" />
          Add a bank
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-5 py-8 text-center text-sm text-muted-foreground">
          No banks yet. Add one so incoming SMS alerts become transactions.
        </div>
      ) : (
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5">
          {templates.map((t) => {
            const Icon = t.direction === "income" ? ArrowDownLeft : ArrowUpRight;
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                  <Icon className="size-[1.1rem]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.95rem] font-medium">{t.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[t.accountName, t.senderMatch, t.identifier ? `••${t.identifier}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <form action={deleteBankTemplateAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${t.label}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
