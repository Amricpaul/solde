"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Bell, Eye, EyeOff, Plus, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// TODO(M2): replace sample data with real MongoDB aggregations once transactions exist.
const sample = {
  totalBalance: "$12,480.50",
  monthDelta: "+ $1,651",
  income: "$5,850.00",
  expenses: "$4,199.50",
};

function TxRow({
  icon: Icon,
  title,
  time,
  amount,
  positive,
}: {
  icon: LucideIcon;
  title: string;
  time: string;
  amount: string;
  positive?: boolean;
}) {
  return (
    <li className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
      <span
        className={cn(
          "text-sm font-semibold",
          positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
        )}
      >
        {amount}
      </span>
    </li>
  );
}

export function DashboardContent({ name }: { name: string }) {
  const [hidden, setHidden] = useState(false);
  const firstName = name.split(" ")[0];
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

      <h1 className="pt-6 text-2xl font-bold tracking-tight lg:text-3xl">
        Hello, {firstName} 👋
      </h1>

      {/* Balance cards: swipe on mobile, grid on desktop */}
      <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {/* Total balance */}
        <div className="w-[86%] shrink-0 snap-center rounded-3xl bg-card p-5 ring-1 ring-foreground/10 shadow-[0_14px_40px_-20px_rgba(0,0,0,0.25)] lg:w-full lg:p-6">
          <p className="text-sm text-muted-foreground">Total balance</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight tabular-nums">
              {hidden ? "••••••" : sample.totalBalance}
            </h2>
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {hidden ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3.5" />
              {hidden ? "••••" : sample.monthDelta}
            </span>
            this month
          </p>
        </div>

        {/* This month */}
        <div className="w-[86%] shrink-0 snap-center rounded-3xl bg-card p-5 ring-1 ring-foreground/10 shadow-[0_14px_40px_-20px_rgba(0,0,0,0.25)] lg:w-full lg:p-6">
          <p className="text-sm text-muted-foreground">This month</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDownLeft className="size-3.5 text-emerald-500" /> Income
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{hidden ? "••••" : sample.income}</p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="size-3.5 text-red-500" /> Expenses
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{hidden ? "••••" : sample.expenses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 lg:max-w-xl lg:pt-6">
        <button
          type="button"
          className="group inline-flex h-12 items-center gap-3 rounded-full bg-card pr-1.5 pl-5 text-sm font-semibold text-foreground ring-1 ring-foreground/10 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
        >
          Add expense
          <span className="flex size-9 items-center justify-center rounded-full bg-red-500 text-white transition-transform duration-200 group-hover:scale-105">
            <ArrowUpRight className="size-4" />
          </span>
        </button>
        <button
          type="button"
          className="group inline-flex h-12 items-center gap-3 rounded-full bg-card pr-1.5 pl-5 text-sm font-semibold text-foreground ring-1 ring-foreground/10 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
        >
          Add income
          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform duration-200 group-hover:scale-105">
            <ArrowDownLeft className="size-4" />
          </span>
        </button>
        <button
          type="button"
          aria-label="Quick add"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#d6f5da] to-[#a3e1ae] text-emerald-900 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.55)] ring-1 ring-emerald-700/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <Plus className="size-5" />
        </button>
      </div>

      {/* Recent transactions */}
      <section className="mt-6 rounded-3xl bg-card px-5 py-4 ring-1 ring-foreground/10 lg:mt-8 lg:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">Recent activity</h3>
          <a href="/transactions" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            View all
          </a>
        </div>

        <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground">TODAY</p>
        <ul className="mt-1 divide-y divide-border">
          <TxRow icon={ArrowUpRight} title="Groceries — Carrefour" time="04:03 PM" amount="- $42.80" />
          <TxRow icon={ArrowDownLeft} title="Refund — Amazon" time="02:15 PM" amount="+ $24.00" positive />
        </ul>

        <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground">YESTERDAY</p>
        <ul className="mt-1 divide-y divide-border">
          <TxRow icon={ArrowUpRight} title="Netflix subscription" time="09:12 PM" amount="- $15.99" />
          <TxRow icon={ArrowDownLeft} title="Salary — Acme Inc." time="08:00 AM" amount="+ $4,200" positive />
        </ul>
      </section>
    </motion.div>
  );
}
