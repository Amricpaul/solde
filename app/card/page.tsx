import type { Metadata } from "next";

import { BalanceCard } from "@/components/balance-card";

export const metadata: Metadata = {
  title: "Balance card",
};

export default function CardPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#fafafa] p-6">
      <BalanceCard />
    </main>
  );
}
