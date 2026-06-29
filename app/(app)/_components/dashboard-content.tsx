"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Bell, Eye, EyeOff, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { RecentTransactions } from "@/modules/transactions/components/transaction-list";
import type { SafeTransaction } from "@/modules/transactions/service";
import { buttonVariants } from "@/components/ui/button";

export function DashboardContent({
  name,
  baseCurrency,
  totalBalanceMinor,
  monthIncomeMinor,
  monthExpenseMinor,
  recent,
}: {
  name: string;
  baseCurrency: string;
  totalBalanceMinor: number;
  monthIncomeMinor: number;
  monthExpenseMinor: number;
  recent: SafeTransaction[];
}) {
  const [hidden, setHidden] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const monthNetMinor = monthIncomeMinor - monthExpenseMinor;
  const money = (minor: number, currency = baseCurrency) =>
    hidden ? "••••••" : formatMoney(minor, currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Greeting */}
      <header className="flex items-center justify-between pt-6 lg:pt-2">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
            {initials}
          </span>
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="text-sm font-semibold text-foreground">{name}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-10 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:text-foreground"
        >
          <Bell className="size-5" />
        </button>
      </header>
      {/* Balance carousel */}
      <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {/* Total balance */}
        <div className="w-[86%] shrink-0 snap-center rounded-3xl bg-card p-5 ring-1 ring-foreground/10 shadow-[0_14px_40px_-20px_rgba(0,0,0,0.25)] lg:w-full lg:p-6">
          <p className="text-sm text-muted-foreground">Total balance</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight tabular-nums">{money(totalBalanceMinor)}</h2>
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {hidden ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
            </button>
          </div>
          {monthNetMinor !== 0 ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  monthNetMinor >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400",
                )}
              >
                <TrendingUp className="size-3.5" />
                {hidden ? "••••" : formatMoney(Math.abs(monthNetMinor), baseCurrency)}
              </span>
              this month
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No activity yet this month</p>
          )}
        </div>

        {/* This month */}
        <div className="w-[86%] shrink-0 snap-center rounded-3xl bg-card p-5 ring-1 ring-foreground/10 shadow-[0_14px_40px_-20px_rgba(0,0,0,0.25)] lg:w-full lg:p-6">
          <p className="text-sm text-muted-foreground">This month</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDownLeft className="size-3.5 text-emerald-500" /> Income
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{money(monthIncomeMinor)}</p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="size-3.5 text-red-500" /> Expenses
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{money(monthExpenseMinor)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <section className="mt-6 rounded-3xl bg-card px-5 py-4 ring-1 ring-foreground/10 lg:mt-8 lg:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">Recent activity</h3>
          <Link
            href="/transactions"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transactions yet. Add your first one above.
          </p>
        ) : (
          <div className="mt-2">
            <RecentTransactions transactions={recent} />
          </div>
        )}
      </section>
    </motion.div>
  );
}
