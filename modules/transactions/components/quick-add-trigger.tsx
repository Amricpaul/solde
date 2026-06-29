import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Full-width quick-add CTA for the desktop sidebar. */
export function QuickAddTrigger() {
  return (
    <Link href="/transactions/new" className={cn(buttonVariants({ size: "lg" }), "mt-auto w-full")}>
      <Plus className="size-5" />
      Add transaction
    </Link>
  );
}

/** Standard button for page headers. */
export function AddTransactionButton() {
  return (
    <Link href="/transactions/new" className={cn(buttonVariants())}>
      <Plus />
      Add transaction
    </Link>
  );
}
