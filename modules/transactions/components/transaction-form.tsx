"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
  type TransactionFormState,
} from "@/modules/transactions/actions";

export interface FormAccount {
  id: string;
  name: string;
  currency: string;
}
export interface FormCategory {
  id: string;
  name: string;
  type: "income" | "expense";
}

type TxType = "income" | "expense";

/** Existing transaction values, in major units, for edit mode. */
export interface TransactionFormValues {
  id: string;
  type: TxType;
  accountId: string;
  amount: string;
  categoryId: string;
  date: string; // yyyy-mm-dd
  note: string;
}

function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function TransactionForm({
  accounts,
  categories,
  initialType,
  redirectTo = "/transactions",
  transaction,
}: {
  accounts: FormAccount[];
  categories: FormCategory[];
  initialType: TxType;
  redirectTo?: string;
  /** When provided, the form edits this transaction instead of creating one. */
  transaction?: TransactionFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(transaction);
  const [state, formAction, pending] = useActionState<TransactionFormState | undefined, FormData>(
    isEdit ? updateTransactionAction : createTransactionAction,
    undefined,
  );
  const [type, setType] = useState<TxType>(transaction?.type ?? initialType);
  const [accountId, setAccountId] = useState(transaction?.accountId ?? accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || "none");

  // Navigate back to the list (and refresh server data) on success.
  useEffect(() => {
    if (state?.success) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [state, router, redirectTo]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <>
      <form action={formAction} className="space-y-4">
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
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={transaction?.amount}
          />
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
          <Input id="date" name="date" type="date" defaultValue={transaction?.date ?? todayISO()} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note">Note (optional)</Label>
          <Input
            id="note"
            name="note"
            placeholder="e.g. Coffee with team"
            defaultValue={transaction?.note}
          />
        </div>

        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        {transaction ? <input type="hidden" name="id" value={transaction.id} /> : null}
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="accountId" value={accountId} />
        <input type="hidden" name="categoryId" value={categoryId === "none" ? "" : categoryId} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" className="flex-1" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Save transaction"}
          </Button>
        </div>

        {isEdit ? (
          // Targets the sibling delete form below via the `form` attribute so it
          // isn't a nested <form>.
          <Button
            type="submit"
            form="delete-transaction"
            variant="ghost"
            size="lg"
            disabled={pending}
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete transaction
          </Button>
        ) : null}
      </form>

      {transaction ? (
        <form id="delete-transaction" action={deleteTransactionAction}>
          <input type="hidden" name="id" value={transaction.id} />
        </form>
      ) : null}
    </>
  );
}
