"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field-group";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
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

function PasswordInput({ autoComplete, error }: { autoComplete: string; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <FloatingLabelInput
      id="password"
      name="password"
      label="Password"
      type={show ? "text" : "password"}
      autoComplete={autoComplete}
      aria-invalid={error ? true : undefined}
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
      className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
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
        <div className="space-y-1.5">
          <FieldGroup>
            {mode === "register" ? (
              <FloatingLabelInput
                id="name"
                name="name"
                label="Name"
                autoComplete="name"
                defaultValue={state?.values?.name}
                aria-invalid={fieldError("name") ? true : undefined}
              />
            ) : null}

            <FloatingLabelInput
              id="email"
              name="email"
              label="Email"
              type="email"
              autoComplete={mode === "login" ? "username webauthn" : "email"}
              defaultValue={state?.values?.email}
              aria-invalid={fieldError("email") ? true : undefined}
            />

            <PasswordInput
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              error={fieldError("password")}
            />
          </FieldGroup>

          {/* Errors live below the grouped box so the seam stays clean. */}
          {[fieldError("name"), fieldError("email"), fieldError("password")]
            .filter(Boolean)
            .map((message, i) => (
              <p key={i} className="text-xs text-destructive">
                {message}
              </p>
            ))}

          {mode === "login" ? (
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
