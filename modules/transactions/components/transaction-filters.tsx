"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowDownLeft, ArrowUpRight, List, Loader2, Search, Tag, Wallet, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { UNCATEGORIZED } from "@/modules/transactions/filters";

export interface FilterOption {
  id: string;
  name: string;
}

const TYPE_OPTIONS = [
  { value: "all", label: "All", icon: List, activeText: "text-foreground" },
  { value: "expense", label: "Expenses", icon: ArrowUpRight, activeText: "text-red-600 dark:text-red-400" },
  { value: "income", label: "Income", icon: ArrowDownLeft, activeText: "text-emerald-600 dark:text-emerald-400" },
] as const;

export function TransactionFilters({
  accounts,
  categories,
}: {
  accounts: FilterOption[];
  categories: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const type = searchParams.get("type") ?? "all";
  const account = searchParams.get("account") ?? "all";
  const category = searchParams.get("category") ?? "all";
  const qParam = searchParams.get("q") ?? "";

  // value→label maps so triggers show the label, not the raw value.
  const accountItems = { all: "All accounts", ...Object.fromEntries(accounts.map((a) => [a.id, a.name])) };
  const categoryItems = {
    all: "All categories",
    [UNCATEGORIZED]: "Uncategorized",
    ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
  };

  // Local, debounced search box; re-sync if the URL is reset elsewhere (e.g. Clear).
  const [q, setQ] = useState(qParam);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional URL→input sync
  useEffect(() => setQ(qParam), [qParam]);

  function commit(next: URLSearchParams) {
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    commit(next);
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function onSearch(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("q", value.trim()), 300);
  }

  const isFiltered = Boolean(qParam) || type !== "all" || account !== "all" || category !== "all";

  function clearAll() {
    setQ("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by note…"
          aria-label="Search transactions"
          className="h-11 pl-9"
        />
        {pending ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Type segmented control */}
        <div className="inline-flex items-center rounded-xl bg-muted p-1 ring-1 ring-border/60">
          {TYPE_OPTIONS.map((opt) => {
            const active = type === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setParam("type", opt.value)}
                aria-pressed={active}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                  active
                    ? cn("bg-card shadow-sm ring-1 ring-border/60", opt.activeText)
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {accounts.length > 0 ? (
          <Select value={account} onValueChange={(v) => setParam("account", v ?? "all")} items={accountItems}>
            <SelectTrigger className="h-10 min-w-38 rounded-xl">
              <Wallet className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Select value={category} onValueChange={(v) => setParam("category", v ?? "all")} items={categoryItems}>
          <SelectTrigger className="h-10 min-w-38 rounded-xl">
            <Tag className="size-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value={UNCATEGORIZED}>Uncategorized</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-10 rounded-xl text-muted-foreground"
          >
            <X className="size-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
