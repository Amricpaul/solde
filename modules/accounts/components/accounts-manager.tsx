"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Reorder, useDragControls } from "motion/react";
import { Archive, GripVertical, Pencil, Plus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { archiveAccountAction, reorderAccountsAction } from "@/modules/accounts/actions";
import { type ManagedAccount } from "./account-form";

const TYPE_LABEL: Record<string, string> = {
  bank: "Bank account",
  credit_card: "Credit card",
  debit_card: "Debit card",
  cash: "Cash",
  other: "Other",
};

function AccountCard({
  account,
  handle,
}: {
  account: ManagedAccount;
  handle?: React.ReactNode;
}) {
  const isCredit = account.type === "credit_card";
  const utilPct = account.utilization != null ? Math.round(account.utilization * 100) : null;
  // Credit cards: balanceMinor is the amount owed (positive). A negative value
  // means the card is overpaid ("in credit"), so show the magnitude and relabel.
  const inCredit = isCredit && account.balanceMinor < 0;
  const displayMinor = isCredit ? Math.abs(account.balanceMinor) : account.balanceMinor;

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
          <Link
            href={`/accounts/${account.id}/edit`}
            aria-label={`Edit ${account.name}`}
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          >
            <Pencil />
          </Link>
          <form action={archiveAccountAction}>
            <input type="hidden" name="id" value={account.id} />
            <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Archive ${account.name}`}>
              <Archive />
            </Button>
          </form>
          {handle}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {isCredit ? (inCredit ? "In credit" : "Balance owed") : "Balance"}
      </p>
      <p className="text-2xl font-bold tracking-tight tabular-nums">
        {formatMoney(displayMinor, account.currency)}
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

/** True when both lists contain the same account ids (order ignored). */
function sameMembers(a: ManagedAccount[], b: ManagedAccount[]): boolean {
  if (a.length !== b.length) return false;
  const ids = new Set(b.map((x) => x.id));
  return a.every((x) => ids.has(x.id));
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/** A reorderable account card. Only the grip handle starts a drag, so the edit
 *  link and archive button stay clickable. */
function SortableAccountCard({ account, onCommit }: { account: ManagedAccount; onCommit: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={account}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onCommit}
      whileDrag={{ scale: 1.02 }}
      className="rounded-2xl"
    >
      <AccountCard
        account={account}
        handle={
          <button
            type="button"
            aria-label={`Reorder ${account.name}`}
            onPointerDown={(e) => controls.start(e)}
            className="flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        }
      />
    </Reorder.Item>
  );
}

export function AccountsManager({ accounts }: { accounts: ManagedAccount[] }) {
  const [items, setItems] = useState(accounts);
  const [prevAccounts, setPrevAccounts] = useState(accounts);
  const [, startTransition] = useTransition();
  // Tracks the live order during a drag so the commit never reads a stale render.
  // Written only inside the reorder handler (not during render).
  const orderRef = useRef<string[]>(accounts.map((a) => a.id));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adopt the server list only when membership changes (add / archive). For a
  // pure reorder we keep the local order — otherwise a momentarily-stale refetch
  // after the commit would snap the cards back. Edits arrive via a full remount.
  if (accounts !== prevAccounts) {
    setPrevAccounts(accounts);
    setItems((current) => (sameMembers(current, accounts) ? current : accounts));
  }

  function commitOrder() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const ids = orderRef.current;
    startTransition(() => {
      void reorderAccountsAction(ids);
    });
  }

  function handleReorder(next: ManagedAccount[]) {
    orderRef.current = next.map((a) => a.id);
    setItems(next);
    // Persist shortly after the order settles; drag-end also flushes immediately.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(commitOrder, 500);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/accounts/new" className={cn(buttonVariants())}>
          <Plus />
          Add account
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
          No accounts yet. Add a bank account or card to start tracking.
        </div>
      ) : (
        <Reorder.Group as="div" axis="y" values={items} onReorder={handleReorder} className="space-y-4">
          {items.map((a) => (
            <SortableAccountCard key={a.id} account={a} onCommit={commitOrder} />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
