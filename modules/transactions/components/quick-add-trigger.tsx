"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAddTransaction } from "./add-transaction-provider";

/** Gold full-width CTA for the desktop sidebar. */
export function QuickAddTrigger() {
  const { open } = useAddTransaction();
  return (
    <button
      type="button"
      onClick={() => open()}
      className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-b from-[#ffe24d] to-[#ffd60a] py-3 text-sm font-semibold text-zinc-900 shadow-[0_10px_24px_-8px_rgba(250,204,21,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(250,204,21,0.8)] active:translate-y-0 active:scale-[0.98]"
    >
      <Plus className="size-5" />
      Add transaction
    </button>
  );
}

/** Standard button for page headers. */
export function AddTransactionButton() {
  const { open } = useAddTransaction();
  return (
    <Button type="button" onClick={() => open()}>
      <Plus />
      Add transaction
    </Button>
  );
}
