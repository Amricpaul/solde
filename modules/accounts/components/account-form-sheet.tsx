"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fromMinor } from "@/lib/money";
import {
  createAccountAction,
  updateAccountAction,
  type AccountFormState,
} from "@/modules/accounts/actions";

export interface ManagedAccount {
  id: string;
  name: string;
  type: string;
  currency: string;
  last4?: string;
  institution?: string;
  openingBalanceMinor: number;
  balanceMinor: number;
  creditLimitMinor?: number;
  statementDay?: number;
  paymentDueDay?: number;
  availableMinor?: number;
  utilization?: number;
}

const TYPE_OPTIONS = [
  { value: "bank", label: "Bank account" },
  { value: "credit_card", label: "Credit card" },
  { value: "debit_card", label: "Debit card" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

export function AccountFormSheet({
  open,
  onOpenChange,
  account,
  defaultCurrency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: ManagedAccount;
  defaultCurrency: string;
}) {
  const router = useRouter();
  const editing = Boolean(account);
  const [state, formAction, pending] = useActionState<AccountFormState | undefined, FormData>(
    editing ? updateAccountAction : createAccountAction,
    undefined,
  );
  const [type, setType] = useState(account?.type ?? "bank");

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  const err = (n: string) => state?.fieldErrors?.[n]?.[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{editing ? "Edit account" : "Add account"}</SheetTitle>
          <SheetDescription>Bank accounts, cards, or cash.</SheetDescription>
        </SheetHeader>

        <form action={formAction} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {editing ? <input type="hidden" name="id" value={account!.id} /> : null}
            <input type="hidden" name="type" value={type} />

            <div className="space-y-1.5">
              <Label htmlFor="acc-name">Name</Label>
              <Input id="acc-name" name="name" defaultValue={account?.name} placeholder="e.g. ADCB Visa" />
              {err("name") ? <p className="text-xs text-destructive">{err("name")}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "bank")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="acc-currency">Currency</Label>
                <Input
                  id="acc-currency"
                  name="currency"
                  maxLength={3}
                  defaultValue={account?.currency ?? defaultCurrency}
                  className="uppercase"
                />
                {err("currency") ? <p className="text-xs text-destructive">{err("currency")}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-last4">Last 4 (optional)</Label>
                <Input id="acc-last4" name="last4" inputMode="numeric" maxLength={4} defaultValue={account?.last4} placeholder="1234" />
                {err("last4") ? <p className="text-xs text-destructive">{err("last4")}</p> : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-institution">Institution (optional)</Label>
              <Input id="acc-institution" name="institution" defaultValue={account?.institution} placeholder="e.g. Emirates NBD" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-opening">
                {type === "credit_card" ? "Current balance owed" : "Opening balance"}
              </Label>
              <Input
                id="acc-opening"
                name="openingBalance"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                defaultValue={account ? String(fromMinor(account.openingBalanceMinor, account.currency)) : "0"}
              />
              {err("openingBalance") ? (
                <p className="text-xs text-destructive">{err("openingBalance")}</p>
              ) : null}
            </div>

            {type === "credit_card" ? (
              <div className="space-y-4 rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">CREDIT CARD</p>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-limit">Credit limit</Label>
                  <Input
                    id="acc-limit"
                    name="creditLimit"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    defaultValue={
                      account?.creditLimitMinor != null
                        ? String(fromMinor(account.creditLimitMinor, account.currency))
                        : ""
                    }
                    placeholder="e.g. 20000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="acc-statement">Statement day</Label>
                    <Input
                      id="acc-statement"
                      name="statementDay"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="31"
                      defaultValue={account?.statementDay ?? ""}
                      placeholder="1–31"
                    />
                    {err("statementDay") ? (
                      <p className="text-xs text-destructive">{err("statementDay")}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="acc-due">Payment due day</Label>
                    <Input
                      id="acc-due"
                      name="paymentDueDay"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="31"
                      defaultValue={account?.paymentDueDay ?? ""}
                      placeholder="1–31"
                    />
                    {err("paymentDueDay") ? (
                      <p className="text-xs text-destructive">{err("paymentDueDay")}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          </div>

          <SheetFooter className="border-t border-border">
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Add account"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
