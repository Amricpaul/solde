import type { Metadata } from "next";

import { WalletScreen } from "@/components/wallet-screen";

export const metadata: Metadata = {
  title: "Mobile sample",
};

export default function SamplePage() {
  return <WalletScreen />;
}
