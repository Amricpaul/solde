"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { SelectItem } from "@/components/ui/select";
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

export function AccountForm({
  account,
  defaultCurrency,
  redirectTo = "/accounts",
}: {
  account?: ManagedAccount;
  defaultCurrency: string;
  redirectTo?: string;
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
      router.push(redirectTo);
      router.refresh();
    }
  }, [state, router, redirectTo]);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const err = (n: string) => state?.fieldErrors?.[n]?.[0];

  return (
    <form action={formAction} className="space-y-4">
      {editing ? <input type="hidden" name="id" value={account!.id} /> : null}
      <input type="hidden" name="type" value={type} />

      <div className="space-y-1.5">
        <FloatingLabelInput id="acc-name" name="name" label="Name" defaultValue={account?.name} />
        {err("name") ? <p className="text-xs text-destructive">{err("name")}</p> : null}
      </div>

      <FloatingLabelSelect
        label="Type"
        value={type}
        onValueChange={(v) => setType(v ?? "bank")}
        items={Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label]))}
      >
        {TYPE_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </FloatingLabelSelect>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FloatingLabelInput
            id="acc-currency"
            name="currency"
            label="Currency"
            maxLength={3}
            defaultValue={account?.currency ?? defaultCurrency}
            className="uppercase"
          />
          {err("currency") ? <p className="text-xs text-destructive">{err("currency")}</p> : null}
        </div>
        <div className="space-y-1.5">
          <FloatingLabelInput id="acc-last4" name="last4" label="Last 4 (optional)" inputMode="numeric" maxLength={4} defaultValue={account?.last4} />
          {err("last4") ? <p className="text-xs text-destructive">{err("last4")}</p> : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <FloatingLabelInput id="acc-institution" name="institution" label="Institution (optional)" defaultValue={account?.institution} />
      </div>

      <div className="space-y-1.5">
        <FloatingLabelInput
          id="acc-opening"
          name="openingBalance"
          label={type === "credit_card" ? "Current balance owed" : "Opening balance"}
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
            <FloatingLabelInput
              id="acc-limit"
              name="creditLimit"
              label="Credit limit"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              defaultValue={
                account?.creditLimitMinor != null
                  ? String(fromMinor(account.creditLimitMinor, account.currency))
                  : ""
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FloatingLabelInput
                id="acc-statement"
                name="statementDay"
                label="Statement day"
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                defaultValue={account?.statementDay ?? ""}
              />
              {err("statementDay") ? (
                <p className="text-xs text-destructive">{err("statementDay")}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <FloatingLabelInput
                id="acc-due"
                name="paymentDueDay"
                label="Payment due day"
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                defaultValue={account?.paymentDueDay ?? ""}
              />
              {err("paymentDueDay") ? (
                <p className="text-xs text-destructive">{err("paymentDueDay")}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}


      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving…" : editing ? "Save changes" : "Add account"}
        </Button>
      </div>
    </form>
  );
}
