"use client";

import { createContext, useCallback, useContext, useState } from "react";

import {
  AddTransactionSheet,
  type SheetAccount,
  type SheetCategory,
} from "./add-transaction-sheet";

type TxType = "income" | "expense";

interface AddTransactionContextValue {
  open: (type?: TxType) => void;
  hasAccounts: boolean;
}

const AddTransactionContext = createContext<AddTransactionContextValue | null>(null);

export function useAddTransaction(): AddTransactionContextValue {
  return useContext(AddTransactionContext) ?? { open: () => {}, hasAccounts: false };
}

export function AddTransactionProvider({
  accounts,
  categories,
  children,
}: {
  accounts: SheetAccount[];
  categories: SheetCategory[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TxType>("expense");
  // Bumped on each open() so the sheet remounts with fresh initial state.
  const [instance, setInstance] = useState(0);

  const openSheet = useCallback((t: TxType = "expense") => {
    setType(t);
    setInstance((n) => n + 1);
    setOpen(true);
  }, []);

  return (
    <AddTransactionContext.Provider value={{ open: openSheet, hasAccounts: accounts.length > 0 }}>
      {children}
      <AddTransactionSheet
        key={instance}
        open={open}
        onOpenChange={setOpen}
        accounts={accounts}
        categories={categories}
        initialType={type}
      />
    </AddTransactionContext.Provider>
  );
}
