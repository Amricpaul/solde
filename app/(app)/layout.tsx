import { BrandLogo } from "@/components/brand-logo";
import { requireUser } from "@/lib/auth/dal";
import { ensureDefaultCategories } from "@/modules/categories/service";
import { QuickAddTrigger } from "@/modules/transactions/components/quick-add-trigger";
import { BottomNav, SidebarNav } from "./_components/app-nav";
import { PageTransition } from "./_components/page-transition";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Real auth gate for the protected group (proxy.ts is only an optimization).
  const user = await requireUser();

  await ensureDefaultCategories(user.id);

  return (
    <div className="relative min-h-svh bg-background">
        {/* Desktop: warm top gradient (no status bar to clash with here) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-72 lg:block">
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              backgroundImage:
                "radial-gradient(120% 70% at 88% -10%, #f7ddc3 0%, transparent 55%)," +
                "linear-gradient(180deg, #fcedda 0%, transparent 60%)",
            }}
          />
         
        </div>

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
            <main className="flex-1 px-5 pb-28 lg:px-10 lg:py-4 lg:pb-12">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
  );
}
