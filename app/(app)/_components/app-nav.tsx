"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, CreditCard, LayoutDashboard, Plus, Settings, Target, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAddTransaction } from "@/modules/transactions/components/add-transaction-provider";

// `mobile` items appear in the bottom tab bar (4 max, around the FAB).
export const navItems: { href: string; label: string; icon: LucideIcon; mobile?: boolean }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, mobile: true },
  { href: "/accounts", label: "Accounts", icon: CreditCard, mobile: true },
  { href: "/budgets", label: "Budgets", icon: Wallet, mobile: true },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"; // root only matches exactly
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Vertical nav for the desktop sidebar. */
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(pathname, href)
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="size-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** Gold quick-add action that opens the Add-transaction sheet. */
export function QuickAddFab() {
  const { open } = useAddTransaction();
  return (
    <button
      type="button"
      aria-label="Add transaction"
      onClick={() => open()}
      className="flex size-14 -translate-y-4 items-center justify-center rounded-full bg-linear-to-br from-[#ffe24d] to-[#ffcc00] text-zinc-900 shadow-[0_10px_24px_-4px_rgba(250,204,21,0.75)] ring-4 ring-background transition-transform active:scale-95"
    >
      <Plus className="size-6" />
    </button>
  );
}

/** Fixed bottom tab bar for mobile: 4 primary items around a center quick-add FAB. */
export function BottomNav() {
  const pathname = usePathname();
  const items = navItems.filter((i) => i.mobile); // 4 primary items; Settings/Goals live elsewhere
  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {left.map((item) => (
          <NavTab key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <QuickAddFab />
        {right.map((item) => (
          <NavTab key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavTab({
  item,
  active,
}: {
  item: { href: string; label: string; icon: LucideIcon };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="flex w-14 flex-col items-center gap-1 py-1"
    >
      <Icon className={cn("size-5 transition-colors", active ? "text-foreground" : "text-muted-foreground")} />
      <span
        className={cn(
          "text-[10px] transition-colors",
          active ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
