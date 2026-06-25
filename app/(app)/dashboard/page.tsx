import { logoutAction } from "@/modules/auth/actions";
import { RegisterPasskeyButton } from "@/modules/auth/components/passkey-buttons";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome, {user.name}</h1>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost">
            Sign out
          </Button>
        </form>
      </header>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-medium">Passkeys</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Add a passkey to sign in with Face ID or your fingerprint next time.
        </p>
        <RegisterPasskeyButton />
      </section>
    </main>
  );
}
