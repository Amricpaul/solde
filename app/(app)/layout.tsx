import Link from "next/link";
import { Settings } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth/dal";
import { listAccounts } from "@/modules/accounts/service";
import { ensureDefaultCategories, listCategories } from "@/modules/categories/service";
import { AddTransactionProvider } from "@/modules/transactions/components/add-transaction-provider";
import { QuickAddTrigger } from "@/modules/transactions/components/quick-add-trigger";
import { BottomNav, SidebarNav } from "./_components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Real auth gate for the protected group (proxy.ts is only an optimization).
  const user = await requireUser();

  await ensureDefaultCategories(user.id);
  const [accounts, categories] = await Promise.all([
    listAccounts(user.id),
    listCategories(user.id),
  ]);
  const sheetAccounts = accounts.map((a) => ({ id: a.id, name: a.name, currency: a.currency }));
  const sheetCategories = categories.map((c) => ({ id: c.id, name: c.name, type: c.type }));

  return (
    <AddTransactionProvider accounts={sheetAccounts} categories={sheetCategories}>
      <div className="relative min-h-svh bg-background">
        {/* Warm top gradient (light) + a subtle one for dark */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(120% 70% at 88% -10%, #f7ddc3 0%, transparent 55%)," +
              "linear-gradient(180deg, #fcedda 0%, transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-72 dark:block"
          style={{
            backgroundImage:
              "radial-gradient(120% 70% at 88% -10%, rgba(235,94,40,0.10) 0%, transparent 55%)",
          }}
        />

        {/* Centered shell: sticky sidebar + main, capped width like the wallet layout */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl">
          {/* Desktop sidebar */}
          <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border px-4 py-7 lg:flex">
            <div className="px-3">
              <BrandLogo />
            </div>

            <div className="mt-9 flex-1">
              <SidebarNav />
            </div>

            <QuickAddTrigger />
          </aside>

          {/* Main column */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile header */}
            <header className="flex h-16 items-center justify-between px-5 lg:hidden">
              <BrandLogo />
              <Link
                href="/settings"
                aria-label="Settings"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              >
                <Settings />
              </Link>
            </header>

            <main className="flex-1 px-5 pb-28 lg:px-10 lg:py-4 lg:pb-12">{children}</main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </AddTransactionProvider>
  );
}
