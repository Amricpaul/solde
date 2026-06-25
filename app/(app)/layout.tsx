import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { requireUser } from "@/lib/auth/dal";
import { logoutAction } from "@/modules/auth/actions";
import { BottomNav, SidebarNav } from "./_components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Real auth gate for the protected group (proxy.ts is only an optimization).
  const user = await requireUser();

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border md:flex">
        <div className="flex h-16 items-center px-6 text-lg font-semibold tracking-tight">
          Solde
        </div>
        <div className="flex-1 px-3">
          <SidebarNav />
        </div>
        <div className="border-t border-border p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <form action={logoutAction} className="flex-1">
              <Button type="submit" variant="ghost" size="lg" className="w-full justify-start">
                <LogOut />
                Sign out
              </Button>
            </form>
            <ModeToggle />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
          <span className="text-lg font-semibold tracking-tight">Solde</span>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
                <LogOut />
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 pb-24 md:px-8 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
