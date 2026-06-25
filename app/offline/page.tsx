import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Solde can&apos;t reach the network right now. Check your connection and try again.
      </p>
    </main>
  );
}
