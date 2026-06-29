"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, CreditCard, LayoutDashboard, Plus, Settings, Target, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// `mobile` items appear in the bottom tab bar (4 max, alongside the quick-add FAB).
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

/** Center quick-add action: a docked black circle that links to Add-transaction. */
function CenterFab() {
  return (
    <div className="flex flex-1 justify-center">
      <Link
        href="/transactions/new"
        aria-label="Add transaction"
        className="flex size-14 -translate-y-3 items-center justify-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-4px_rgba(0,0,0,0.35)] ring-4 ring-card transition-transform active:scale-95"
      >
        <Plus className="size-6" />
      </Link>
    </div>
  );
}

/**
 * Mobile bottom nav: a light, bottom-anchored bar with always-visible labels.
 * Two tabs sit on each side of a docked black quick-add FAB; the active tab gets
 * a filled flame tile and a flame label.
 */
export function BottomNav() {
  const pathname = usePathname();
  const items = navItems.filter((i) => i.mobile); // Settings/Goals live elsewhere
  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <nav className="flex items-end justify-around gap-1 rounded-t-3xl bg-card/70 px-2 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-foreground/5 backdrop-blur-xl supports-backdrop-filter:bg-card/60">
        {left.map((item) => (
          <NavTab key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <CenterFab />
        {right.map((item) => (
          <NavTab key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>
    </div>
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
      className="flex flex-1 flex-col items-center gap-1 py-1"
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl transition-colors",
          active ? "bg-primary text-white" : "text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span
        className={cn(
          "text-[0.7rem] font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
