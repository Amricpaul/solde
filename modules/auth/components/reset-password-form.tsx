"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { resetPasswordAction, type AuthFormState } from "@/modules/auth/actions";

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  error,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <FloatingLabelInput
        id={id}
        name={name}
        label={label}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        endAdornment={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="flex items-center rounded-lg px-2 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState | undefined, FormData>(
    resetPasswordAction,
    undefined,
  );
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
      </div>

      <AnimatePresence>
        {state?.error ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="token" value={token} />
        <PasswordField
          id="password"
          name="password"
          label="New password"
          autoComplete="new-password"
          error={fieldError("password")}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          error={fieldError("confirmPassword")}
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}
