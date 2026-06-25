"use client";

import { useState } from "react";
import { ArrowDownLeft, Eye, EyeOff, TrendingUp } from "lucide-react";

function CatAvatar() {
  return (
    <svg viewBox="0 0 64 64" className="size-8" aria-hidden>
      <path d="M14 6 L26 28 L6 28 Z" fill="#171717" />
      <path d="M50 6 L58 28 L38 28 Z" fill="#171717" />
      <circle cx="32" cy="38" r="21" fill="#171717" />
      <ellipse cx="24" cy="36" rx="3" ry="5.5" fill="#f5c518" />
      <ellipse cx="40" cy="36" rx="3" ry="5.5" fill="#f5c518" />
    </svg>
  );
}

export function BalanceCard() {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white/70 p-4 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#e8e3f4]">
          <CatAvatar />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight text-zinc-900">Abhishek Hirapara</p>
          <p className="text-sm text-zinc-500">P2P agent</p>
        </div>
      </div>

      {/* Inner gradient card */}
      <div
        className="relative overflow-hidden rounded-[1.6rem] bg-white p-6"
        style={{
          backgroundImage:
            "radial-gradient(120% 120% at 0% 100%, #bfe0ef 0%, transparent 46%)," +
            "radial-gradient(120% 130% at 100% 0%, #f7d4b1 0%, transparent 50%)," +
            "radial-gradient(110% 120% at 100% 100%, #f9dcc4 0%, transparent 55%)",
        }}
      >
        {/* Balance + currency */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold tracking-tight text-zinc-900 tabular-nums">
                {hidden ? "$ • • • • •" : "$6,992.75"}
              </h2>
              <button
                type="button"
                onClick={() => setHidden((h) => !h)}
                aria-label={hidden ? "Show balance" : "Hide balance"}
                className="text-zinc-400 transition-colors hover:text-zinc-600"
              >
                {hidden ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-zinc-600">+1,651 this month</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-sm font-medium text-zinc-800 shadow-sm">
                <TrendingUp className="size-3.5 text-emerald-500" />
                11.5%
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-sm">
            <span className="text-base leading-none">🇺🇸</span>
            <span className="text-sm font-medium text-zinc-800">USD</span>
            <span className="text-base leading-none">🇮🇳</span>
          </div>
        </div>

        {/* Transaction row */}
        <div className="mt-10 flex items-center justify-between rounded-[1.3rem] bg-white/55 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-white shadow-sm">
              <ArrowDownLeft className="size-5 text-zinc-900" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-zinc-900">USD Deposit</p>
              <p className="text-sm text-zinc-500">Today 2:30 PM</p>
            </div>
          </div>
          <span className="font-semibold text-emerald-600">+ $500.00</span>
        </div>
      </div>
    </div>
  );
}
