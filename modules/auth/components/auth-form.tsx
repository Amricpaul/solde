"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "@/modules/auth/actions";

type AuthAction = (
  prev: AuthFormState | undefined,
  formData: FormData,
) => Promise<AuthFormState>;

interface AuthFormProps {
  mode: "login" | "register";
  action: AuthAction;
  /** Optional success message shown above the form (e.g. after a password reset). */
  notice?: string;
  /** Optional extra controls (e.g. the passkey button) rendered under the form. */
  children?: React.ReactNode;
}

const copy = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to your Solde account",
    submit: "Sign in",
    altText: "Need an account?",
    altHref: "/register",
    altLink: "Create one",
  },
  register: {
    title: "Create your account",
    subtitle: "Start tracking your money with Solde",
    submit: "Create account",
    altText: "Already have an account?",
    altHref: "/login",
    altLink: "Sign in",
  },
} as const;

function PasswordInput({ autoComplete }: { autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id="password"
        name="password"
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        className="pr-9"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-2.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function AuthForm({ mode, action, notice, children }: AuthFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState | undefined, FormData>(
    action,
    undefined,
  );
  const t = copy[mode];
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {notice && !state?.error ? (
        <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          {notice}
        </p>
      ) : null}

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
        {mode === "register" ? (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" defaultValue={state?.values?.name} />
            {fieldError("name") ? (
              <p className="text-xs text-destructive">{fieldError("name")}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete={mode === "login" ? "username webauthn" : "email"}
            defaultValue={state?.values?.email}
          />
          {fieldError("email") ? (
            <p className="text-xs text-destructive">{fieldError("email")}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === "login" ? (
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            ) : null}
          </div>
          <PasswordInput
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {fieldError("password") ? (
            <p className="text-xs text-destructive">{fieldError("password")}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Please wait…" : t.submit}
        </Button>
      </form>

      {children ? <div className="mt-4">{children}</div> : null}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.altText}{" "}
        <Link href={t.altHref} className="font-medium text-primary underline-offset-4 hover:underline">
          {t.altLink}
        </Link>
      </p>
    </motion.div>
  );
}
