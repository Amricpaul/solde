"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createTransactionAction, type TransactionFormState } from "@/modules/transactions/actions";

export interface SheetAccount {
  id: string;
  name: string;
  currency: string;
}
export interface SheetCategory {
  id: string;
  name: string;
  type: "income" | "expense";
}

type TxType = "income" | "expense";

function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function AddTransactionSheet({
  open,
  onOpenChange,
  accounts,
  categories,
  initialType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: SheetAccount[];
  categories: SheetCategory[];
  initialType: TxType;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<TransactionFormState | undefined, FormData>(
    createTransactionAction,
    undefined,
  );
  const [type, setType] = useState<TxType>(initialType);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState("none");

  // Close + refresh server data on success.
  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];
  const hasAccounts = accounts.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Add transaction</SheetTitle>
          <SheetDescription>Record income or an expense.</SheetDescription>
        </SheetHeader>

        {!hasAccounts ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              You need an account before adding transactions.
            </p>
            <Link
              href="/settings"
              onClick={() => onOpenChange(false)}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Add an account
            </Link>
          </div>
        ) : (
          <form action={formAction} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType("expense");
                    setCategoryId("none");
                  }}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium ring-1 transition-colors",
                    type === "expense"
                      ? "bg-red-500/10 text-red-600 ring-red-500/30 dark:text-red-400"
                      : "text-muted-foreground ring-border hover:bg-muted",
                  )}
                >
                  <ArrowUpRight className="size-4" /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    setCategoryId("none");
                  }}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium ring-1 transition-colors",
                    type === "income"
                      ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400"
                      : "text-muted-foreground ring-border hover:bg-muted",
                  )}
                >
                  <ArrowDownLeft className="size-4" /> Income
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" />
                {fieldError("amount") ? (
                  <p className="text-xs text-destructive">{fieldError("amount")}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} · {a.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("accountId") ? (
                  <p className="text-xs text-destructive">{fieldError("accountId")}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "none")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Uncategorized</SelectItem>
                    {visibleCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={todayISO()} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note">Note (optional)</Label>
                <Input id="note" name="note" placeholder="e.g. Coffee with team" />
              </div>

              {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="accountId" value={accountId} />
              <input type="hidden" name="categoryId" value={categoryId === "none" ? "" : categoryId} />
            </div>

            <SheetFooter className="border-t border-border">
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Saving…" : "Save transaction"}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
