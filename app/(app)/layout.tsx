import { requireUser } from "@/lib/auth/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Real auth gate for the protected group (proxy.ts is only an optimization).
  await requireUser();
  return <div className="min-h-svh bg-background">{children}</div>;
}
