"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CreditCard,
  Eye,
  EyeOff,
  Home,
  LineChart,
  Plus,
  Scan,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "statistic", label: "Statistic", icon: LineChart },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "card", label: "Card", icon: CreditCard },
];

function Flag({ emoji }: { emoji: string }) {
  return (
    <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-lg leading-none ring-1 ring-black/5">
      {emoji}
    </span>
  );
}

function AccountCard({
  flag,
  currency,
  balance,
  account,
  validThru,
  hidden,
  onToggle,
}: {
  flag: string;
  currency: string;
  balance: string;
  account: string;
  validThru: string;
  hidden: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="w-[86%] shrink-0 snap-center rounded-[1.75rem] bg-white p-5 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.22)] lg:w-full lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag emoji={flag} />
          <span className="text-sm font-medium text-zinc-900">{currency}</span>
        </div>
        <span className="text-base font-bold tracking-tight text-[#1a1f71] italic">VISA</span>
      </div>

      <p className="mt-6 text-sm text-zinc-400">Your balance</p>
      <div className="mt-1 flex items-center gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 tabular-nums">
          {hidden ? "••••••" : balance}
        </h2>
        <button
          type="button"
          onClick={onToggle}
          aria-label={hidden ? "Show balance" : "Hide balance"}
          className="text-zinc-400 transition-colors hover:text-zinc-600"
        >
          {hidden ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
        </button>
      </div>

      <div className="mt-6 flex justify-between">
        <div>
          <p className="text-xs text-zinc-400">Account number</p>
          <p className="text-sm font-medium text-zinc-800">{account}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">Valid Thru</p>
          <p className="text-sm font-medium text-zinc-800">{validThru}</p>
        </div>
      </div>
    </div>
  );
}

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
        <span className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-zinc-900">{title}</p>
          <p className="text-xs text-zinc-400">{time}</p>
        </div>
      </div>
      <span className={cn("text-sm font-semibold", positive ? "text-emerald-600" : "text-red-500")}>
        {amount}
      </span>
    </li>
  );
}

export function WalletScreen() {
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("home");
  const toggle = () => setHidden((h) => !h);

  return (
    <div className="relative min-h-svh bg-[#fbfbfb] text-zinc-900">
      {/* Warm top gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          backgroundImage:
            "radial-gradient(120% 70% at 88% -10%, #f7ddc3 0%, transparent 55%)," +
            "linear-gradient(180deg, #fcedda 0%, #fbfbfb 46%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-zinc-200/70 px-4 py-7 lg:flex">
          <div className="flex items-baseline-last gap-0.5 px-3">
            <Image src="/logo.svg" alt="Solde" width={33} height={28} className="h-6 w-auto" unoptimized priority />
            <span className="text-[29px] leading-none tracking-normal font-bold uppercase">olde</span>
          </div>
          <nav className="mt-9 flex flex-col gap-1">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                aria-current={active === key ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active === key
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            className="group mt-auto flex items-center justify-center gap-2 rounded-2xl bg-linear-to-b from-[#ffe24d] to-[#ffd60a] py-3 text-sm font-semibold text-zinc-900 shadow-[0_10px_24px_-8px_rgba(250,204,21,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(250,204,21,0.85)] active:translate-y-0 active:scale-[0.98]"
          >
            <Scan className="size-5 transition-transform duration-200 group-hover:rotate-6" />
            Scan to pay
          </button>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 pb-28 lg:pb-12">
          <div className="mx-auto w-full max-w-3xl px-5 lg:max-w-4xl lg:px-10">
            {/* Header */}
            <header className="flex items-center justify-between pt-6 lg:pt-8">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-lg ring-1 ring-black/5">
                  🧑🏻
                </span>
                <div className="leading-tight">
                  <p className="text-xs text-zinc-400">Welcome back,</p>
                  <p className="text-sm font-semibold text-zinc-900">Akmal Nasrulloh</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Notifications"
                className="flex size-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm transition-colors hover:text-zinc-900"
              >
                <Bell className="size-5" />
              </button>
            </header>

            <h1 className="pt-6 text-2xl font-bold tracking-tight lg:pt-8 lg:text-3xl">Account</h1>

            {/* Cards: swipeable on mobile, grid on desktop */}
            <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
              <AccountCard
                flag="🇺🇸"
                currency="US Dollar"
                balance="$40,500.80"
                account="**** 9934"
                validThru="05/28"
                hidden={hidden}
                onToggle={toggle}
              />
              <AccountCard
                flag="🇮🇩"
                currency="Rupiah"
                balance="Rp428,900"
                account="**** 7732"
                validThru="11/27"
                hidden={hidden}
                onToggle={toggle}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 lg:max-w-xl lg:pt-6">
              <button
                type="button"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pr-1.5 pl-5 text-sm font-semibold text-zinc-900 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-10px_rgba(0,0,0,0.32)] active:translate-y-0 active:scale-[0.98]"
              >
                Request
                <span className="flex size-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-transform duration-200 group-hover:scale-105">
                  <ArrowDownLeft className="size-4" />
                </span>
              </button>
              <button
                type="button"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pr-1.5 pl-5 text-sm font-semibold text-zinc-900 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-10px_rgba(0,0,0,0.32)] active:translate-y-0 active:scale-[0.98]"
              >
                Transfer
                <span className="flex size-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-transform duration-200 group-hover:scale-105">
                  <ArrowUpRight className="size-4" />
                </span>
              </button>
              <button
                type="button"
                aria-label="Add account"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#d6f5da] to-[#a3e1ae] text-emerald-900 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.55)] ring-1 ring-emerald-700/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-6px_rgba(16,185,129,0.65)] active:translate-y-0 active:scale-95"
              >
                <Plus className="size-5" />
              </button>
            </div>

            {/* Transactions */}
            <section className="mt-6 rounded-[2rem] bg-white px-5 pt-3 pb-2 shadow-[0_-10px_30px_-18px_rgba(0,0,0,0.18)] lg:mt-8 lg:px-6 lg:shadow-sm">
              <div className="mx-auto h-1 w-10 rounded-full bg-zinc-200 lg:hidden" />
              <div className="mt-4 flex items-center justify-between lg:mt-1">
                <h3 className="text-lg font-bold tracking-tight text-zinc-900">Transaction</h3>
                <button type="button" className="text-sm text-zinc-400 transition-colors hover:text-zinc-600">
                  View all
                </button>
              </div>

              <p className="mt-3 text-xs font-medium tracking-wide text-zinc-400">TODAY</p>
              <ul className="mt-1 divide-y divide-zinc-100">
                <TxRow icon={ArrowUpRight} title="Transfer to Firmansyah A." time="04:03 PM" amount="- $20" />
                <TxRow
                  icon={ArrowDownLeft}
                  title="Receive from Adam S."
                  time="02:15 PM"
                  amount="+ $1,300"
                  positive
                />
              </ul>

              <p className="mt-4 text-xs font-medium tracking-wide text-zinc-400">YESTERDAY</p>
              <ul className="mt-1 divide-y divide-zinc-100">
                <TxRow icon={ArrowUpRight} title="Netflix subscription" time="09:12 PM" amount="- $15.99" />
                <TxRow
                  icon={ArrowDownLeft}
                  title="Salary — Acme Inc." time="08:00 AM" amount="+ $4,200" positive
                />
              </ul>
            </section>
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/70 bg-white/95 backdrop-blur lg:hidden">
        <div className="relative mx-auto flex max-w-md items-end justify-around px-2 pt-2.5 pb-6">
          {NAV.slice(0, 2).map(({ key, label, icon: Icon }) => (
            <NavTab key={key} icon={Icon} label={label} active={active === key} onClick={() => setActive(key)} />
          ))}
          <div className="w-14" aria-hidden />
          {NAV.slice(2).map(({ key, label, icon: Icon }) => (
            <NavTab key={key} icon={Icon} label={label} active={active === key} onClick={() => setActive(key)} />
          ))}
          <button
            type="button"
            aria-label="Scan to pay"
            className="absolute -top-4 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-linear-to-br from-[#ffe24d] to-[#ffcc00] text-zinc-900 shadow-[0_10px_24px_-4px_rgba(250,204,21,0.75)] ring-4 ring-white transition-transform active:scale-95"
          >
            <Scan className="size-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}

function NavTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="flex w-14 flex-col items-center gap-1 py-1"
    >
      <Icon className={cn("size-5 transition-colors", active ? "text-zinc-900" : "text-zinc-400")} />
      <span
        className={cn(
          "text-[10px] transition-colors",
          active ? "font-medium text-zinc-900" : "text-zinc-400",
        )}
      >
        {label}
      </span>
    </button>
  );
}
