"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createGoalAction,
  deleteGoalAction,
  updateGoalAction,
  type GoalFormState,
} from "@/modules/goals/actions";

/** Existing goal values (target in major units) for edit mode. */
export interface GoalFormValues {
  id: string;
  name: string;
  targetAmount: string;
  targetDate?: string; // yyyy-mm-dd
  color?: string;
}

/** Parse a yyyy-mm-dd string into a local Date (no timezone drift). */
function parseYMD(value?: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Format a Date back to yyyy-mm-dd in local time. */
function toYMD(date?: Date): string {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function GoalForm({ currency, goal }: { currency: string; goal?: GoalFormValues }) {
  const router = useRouter();
  const editing = Boolean(goal);
  const [state, formAction, pending] = useActionState<GoalFormState | undefined, FormData>(
    editing ? updateGoalAction : createGoalAction,
    undefined,
  );
  const [date, setDate] = useState<Date | undefined>(parseYMD(goal?.targetDate));

  useEffect(() => {
    if (state?.success) {
      router.push("/goals");
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const err = (n: string) => state?.fieldErrors?.[n]?.[0];

  return (
    <>
      <form action={formAction} className="space-y-4">
        {editing ? <input type="hidden" name="id" value={goal!.id} /> : null}
        <input type="hidden" name="targetDate" value={toYMD(date)} />

        <div className="space-y-1.5">
          <Label htmlFor="goal-name">Goal name</Label>
          <Input
            id="goal-name"
            name="name"
            placeholder="e.g. Trip to Japan"
            defaultValue={goal?.name}
          />
          {err("name") ? <p className="text-xs text-destructive">{err("name")}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal-target">Target amount ({currency})</Label>
          <Input
            id="goal-target"
            name="targetAmount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={goal?.targetAmount}
          />
          {err("targetAmount") ? (
            <p className="text-xs text-destructive">{err("targetAmount")}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal-date">Target date (optional)</Label>
          <DatePicker id="goal-date" value={date} onChange={setDate} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal-color">Color</Label>
          <Input
            id="goal-color"
            name="color"
            type="color"
            defaultValue={goal?.color ?? "#eb5e28"}
            className="h-9 w-16 p-1"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Saving…" : editing ? "Save changes" : "Create goal"}
          </Button>
        </div>

        {editing ? (
          <Button
            type="submit"
            form="delete-goal"
            variant="ghost"
            size="lg"
            disabled={pending}
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete goal
          </Button>
        ) : null}
      </form>

      {editing ? (
        <form id="delete-goal" action={deleteGoalAction}>
          <input type="hidden" name="id" value={goal!.id} />
        </form>
      ) : null}
    </>
  );
}
