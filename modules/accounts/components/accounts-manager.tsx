"use client";

import { useState } from "react";
import { Archive, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { archiveAccountAction } from "@/modules/accounts/actions";
import { AccountFormSheet, type ManagedAccount } from "./account-form-sheet";

const TYPE_LABEL: Record<string, string> = {
  bank: "Bank account",
  credit_card: "Credit card",
  debit_card: "Debit card",
  cash: "Cash",
  other: "Other",
};

function AccountCard({ account, onEdit }: { account: ManagedAccount; onEdit: () => void }) {
  const isCredit = account.type === "credit_card";
  const utilPct = account.utilization != null ? Math.round(account.utilization * 100) : null;

  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{account.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {TYPE_LABEL[account.type] ?? "Account"}
            {account.last4 ? ` · •••• ${account.last4}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${account.name}`} onClick={onEdit}>
            <Pencil />
          </Button>
          <form action={archiveAccountAction}>
            <input type="hidden" name="id" value={account.id} />
            <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Archive ${account.name}`}>
              <Archive />
            </Button>
          </form>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{isCredit ? "Balance owed" : "Balance"}</p>
      <p className="text-2xl font-bold tracking-tight tabular-nums">
        {formatMoney(account.balanceMinor, account.currency)}
      </p>

      {isCredit && account.creditLimitMinor != null ? (
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                (utilPct ?? 0) >= 90 ? "bg-red-500" : (utilPct ?? 0) >= 50 ? "bg-amber-500" : "bg-emerald-500",
              )}
              style={{ width: `${Math.min(100, Math.max(0, utilPct ?? 0))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatMoney(account.availableMinor ?? 0, account.currency)} available</span>
            <span>{utilPct}% used</span>
          </div>
        </div>
      ) : null}

      {isCredit && (account.statementDay || account.paymentDueDay) ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {account.statementDay ? `Statement on the ${ordinal(account.statementDay)}` : ""}
          {account.statementDay && account.paymentDueDay ? " · " : ""}
          {account.paymentDueDay ? `Due on the ${ordinal(account.paymentDueDay)}` : ""}
        </p>
      ) : null}
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function AccountsManager({
  accounts,
  baseCurrency,
}: {
  accounts: ManagedAccount[];
  baseCurrency: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedAccount | undefined>(undefined);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          <Plus />
          Add account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
          No accounts yet. Add a bank account or card to start tracking.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              onEdit={() => {
                setEditing(a);
                setOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <AccountFormSheet
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={setOpen}
        account={editing}
        defaultCurrency={baseCurrency}
      />
    </div>
  );
}
