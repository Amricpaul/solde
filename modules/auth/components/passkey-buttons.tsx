"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint } from "lucide-react";

import { Button } from "@/components/ui/button";
import { registerPasskey, signInWithPasskey } from "@/modules/auth/passkey-client";

/** Shown on the login page — authenticate with an existing passkey. */
export function PasskeySignInButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setPending(true);
    try {
      await signInWithPasskey();
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Passkey sign-in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onClick}
        disabled={pending}
      >
        <Fingerprint />
        {pending ? "Waiting for passkey…" : "Sign in with a passkey"}
      </Button>
      {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/** Shown on the dashboard — enroll a new passkey for the logged-in user. */
export function RegisterPasskeyButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      await registerPasskey();
      setMessage("Passkey registered. You can now sign in with it.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register passkey");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" onClick={onClick} disabled={pending}>
        <Fingerprint />
        {pending ? "Follow the prompt…" : "Register a passkey"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
