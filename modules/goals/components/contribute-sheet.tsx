"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { contributeGoalAction, type GoalFormState } from "@/modules/goals/actions";

export function ContributeSheet({
  goalId,
  goalName,
  currency,
}: {
  goalId: string;
  goalName: string;
  currency: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<GoalFormState | undefined, FormData>(
    contributeGoalAction,
    undefined,
  );

  // Close the sheet as soon as a contribution succeeds. Comparing against the
  // previous action result (a fresh object each run) fires once per success,
  // including repeat contributions — and keeps setState out of the effect.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setOpen(false);
  }

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="outline" size="sm" className="w-full rounded-full" />}
      >
        <Plus className="size-4" />
        Add funds
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md gap-0 rounded-t-3xl p-5">
        <SheetHeader className="p-0">
          <SheetTitle>{goalName}</SheetTitle>
          <SheetDescription>Move money into or out of this goal.</SheetDescription>
        </SheetHeader>

        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={goalId} />
          <div className="space-y-1.5">
            <FloatingLabelInput
              id={`contribute-${goalId}`}
              name="amount"
              label={`Amount (${currency})`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              autoFocus
            />
            {state?.fieldErrors?.amount?.[0] ? (
              <p className="text-xs text-destructive">{state.fieldErrors.amount[0]}</p>
            ) : null}
          </div>

          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="submit"
              name="direction"
              value="withdraw"
              variant="outline"
              size="lg"
              disabled={pending}
            >
              <Minus className="size-4" />
              Withdraw
            </Button>
            <Button type="submit" name="direction" value="add" size="lg" disabled={pending}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
