"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Bell, CreditCard, Eye, EyeOff, Plus, TrendingUp, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { useAddTransaction } from "@/modules/transactions/components/add-transaction-provider";
import { RecentTransactions } from "@/modules/transactions/components/transaction-list";
import type { SafeTransaction } from "@/modules/transactions/service";

interface DashboardAccount {
  id: string;
  name: string;
  type: string;
  currency: string;
  balanceMinor: number;
  last4?: string;
  creditLimitMinor?: number;
  availableMinor?: number;
  utilization?: number;
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  bank: "Bank account",
  credit_card: "Credit card",
  debit_card: "Debit card",
  cash: "Cash",
  other: "Account",
};

export function DashboardContent({
  name,
  baseCurrency,
  totalBalanceMinor,
  monthIncomeMinor,
  monthExpenseMinor,
  accounts,
  recent,
}: {
  name: string;
  baseCurrency: string;
  totalBalanceMinor: number;
  monthIncomeMinor: number;
  monthExpenseMinor: number;
  accounts: DashboardAccount[];
  recent: SafeTransaction[];
}) {
  const { open } = useAddTransaction();
  const [hidden, setHidden] = useState(false);
  const firstName = name.split(" ")[0];
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

      <h1 className="pt-6 text-2xl font-bold tracking-tight lg:text-3xl">Hello, {firstName} 👋</h1>

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

        {/* One card per account */}
        {accounts.map((a) => {
          const isCredit = a.type === "credit_card";
          const utilPct = a.utilization != null ? Math.round(a.utilization * 100) : null;
          return (
            <div
              key={a.id}
              className="w-[86%] shrink-0 snap-center rounded-3xl bg-card p-5 ring-1 ring-foreground/10 shadow-[0_14px_40px_-20px_rgba(0,0,0,0.25)] lg:w-full lg:p-6"
            >
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium">{a.name}</p>
                {isCredit ? (
                  <CreditCard className="size-4 text-muted-foreground" />
                ) : (
                  <Wallet className="size-4 text-muted-foreground" />
                )}
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">
                {money(a.balanceMinor, a.currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isCredit ? "Owed" : (ACCOUNT_TYPE_LABEL[a.type] ?? "Account")}
                {a.last4 ? ` · •••• ${a.last4}` : ""}
              </p>
              {isCredit && a.creditLimitMinor != null && !hidden ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatMoney(a.availableMinor ?? 0, a.currency)} available
                  {utilPct != null ? ` · ${utilPct}% used` : ""}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {accounts.length === 0 ? (
        <Link
          href="/settings"
          className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-border bg-card/40 px-5 py-4 text-sm transition-colors hover:bg-muted"
        >
          <span className="text-muted-foreground">Add a bank account or card to get started.</span>
          <span className="font-medium text-foreground">Add account →</span>
        </Link>
      ) : null}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 lg:max-w-xl lg:pt-6">
        <button
          type="button"
          onClick={() => open("expense")}
          className="group inline-flex h-12 items-center gap-3 rounded-full bg-card pr-1.5 pl-5 text-sm font-semibold text-foreground ring-1 ring-foreground/10 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
        >
          Add expense
          <span className="flex size-9 items-center justify-center rounded-full bg-red-500 text-white transition-transform duration-200 group-hover:scale-105">
            <ArrowUpRight className="size-4" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => open("income")}
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
          onClick={() => open()}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#d6f5da] to-[#a3e1ae] text-emerald-900 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.55)] ring-1 ring-emerald-700/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <Plus className="size-5" />
        </button>
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
