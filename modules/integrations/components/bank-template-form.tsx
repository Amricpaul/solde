"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

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
  analyzeMessagesAction,
  saveBankTemplateAction,
  type AnalyzeProposal,
  type BankTemplateFormState,
} from "@/modules/integrations/actions";

export interface FormAccount {
  id: string;
  name: string;
  currency: string;
}

export function BankTemplateForm({ accounts }: { accounts: FormAccount[] }) {
  const router = useRouter();
  const [messageA, setMessageA] = useState("");
  const [messageB, setMessageB] = useState("");
  const [proposal, setProposal] = useState<AnalyzeProposal | null>(null);
  const [analyzing, startAnalyze] = useTransition();

  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [direction, setDirection] = useState<"income" | "expense">("expense");

  const [state, formAction, saving] = useActionState<BankTemplateFormState | undefined, FormData>(
    saveBankTemplateAction,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Bank added.");
      router.push("/settings/integrations");
      router.refresh();
    }
  }, [state, router]);
  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  function analyze() {
    startAnalyze(async () => {
      const res = await analyzeMessagesAction(messageA, messageB);
      if (res.error || !res.proposal) {
        toast.error(res.error ?? "Could not analyze those messages.");
        return;
      }
      setProposal(res.proposal);
      setDirection(res.proposal.direction);
    });
  }

  const err = (n: string) => state?.fieldErrors?.[n]?.[0];
  const accountItems = Object.fromEntries(accounts.map((a) => [a.id, `${a.name} · ${a.currency}`]));
  const defaultCurrency =
    proposal?.currency ?? accounts.find((a) => a.id === accountId)?.currency ?? "AED";

  return (
    <div className="space-y-5">
      {/* Step 1: paste two messages */}
      <div className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
        <p className="text-sm text-muted-foreground">
          Paste two recent alert messages from the <span className="font-medium">same card</span>.
          We compare them to learn the format automatically.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="msg-a">Message 1</Label>
          <textarea
            id="msg-a"
            value={messageA}
            onChange={(e) => setMessageA(e.target.value)}
            rows={3}
            placeholder="AED 42.80 spent on card ending 1234 at CARREFOUR on 30/06/2026"
            className="w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="msg-b">Message 2</Label>
          <textarea
            id="msg-b"
            value={messageB}
            onChange={(e) => setMessageB(e.target.value)}
            rows={3}
            placeholder="AED 15.00 spent on card ending 1234 at TALABAT on 29/06/2026"
            className="w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
        <Button type="button" onClick={analyze} disabled={analyzing || !messageA || !messageB}>
          <Sparkles className="size-4" />
          {analyzing ? "Analyzing…" : "Analyze messages"}
        </Button>
      </div>

      {/* Step 2: confirm + save */}
      {proposal ? (
        <form action={formAction} className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
          <div className="rounded-xl bg-muted/50 p-3 text-sm">
            <p className="mb-1 font-medium">Detected</p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>Amount: <span className="text-foreground">{proposal.preview.amount ?? "—"}</span></li>
              <li>Merchant: <span className="text-foreground">{proposal.preview.note ?? "—"}</span></li>
              <li>Date: <span className="text-foreground">{proposal.preview.date ?? "—"}</span></li>
              <li>Card identifier: <span className="text-foreground">{proposal.identifier ?? "—"}</span></li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bt-label">Name</Label>
            <Input id="bt-label" name="label" placeholder="e.g. ADCB Credit" />
            {err("label") ? <p className="text-xs text-destructive">{err("label")}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label>Account</Label>
            <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")} items={accountItems}>
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
            {err("accountId") ? <p className="text-xs text-destructive">{err("accountId")}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bt-sender">SMS sender</Label>
            <Input id="bt-sender" name="senderMatch" placeholder="e.g. ADCBAlert" />
            <p className="text-xs text-muted-foreground">The sender ID shown in Messages for this bank.</p>
            {err("senderMatch") ? <p className="text-xs text-destructive">{err("senderMatch")}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bt-identifier">Card identifier</Label>
              <Input id="bt-identifier" name="identifier" defaultValue={proposal.identifier ?? ""} placeholder="1234" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bt-currency">Currency</Label>
              <Input id="bt-currency" name="currency" maxLength={3} defaultValue={defaultCurrency} className="uppercase" />
              {err("currency") ? <p className="text-xs text-destructive">{err("currency")}</p> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Direction</Label>
            <Select
              value={direction}
              onValueChange={(v) => setDirection((v ?? "expense") as "income" | "expense")}
              items={{ expense: "Expense (debit)", income: "Income (credit)" }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense (debit)</SelectItem>
                <SelectItem value="income">Income (credit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Carried from the analysis step */}
          <input type="hidden" name="accountId" value={accountId} />
          <input type="hidden" name="direction" value={direction} />
          <input type="hidden" name="pattern" value={proposal.pattern} />
          <input type="hidden" name="amountGroup" value={proposal.amountGroup ?? ""} />
          <input type="hidden" name="dateGroup" value={proposal.dateGroup ?? ""} />
          <input type="hidden" name="noteGroup" value={proposal.noteGroup ?? ""} />
          <input type="hidden" name="directionRules" value={JSON.stringify(proposal.directionRules)} />

          <Button type="submit" size="lg" className="w-full" disabled={saving || !proposal.amountGroup}>
            {saving ? "Saving…" : "Save bank"}
          </Button>
          {!proposal.amountGroup ? (
            <p className="text-xs text-destructive">
              No amount field was detected — try two messages that differ mainly in the amount.
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
