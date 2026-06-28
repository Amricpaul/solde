"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motion } from "motion/react";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction, type AuthFormState } from "@/modules/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState | undefined, FormData>(
    forgotPasswordAction,
    undefined,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      {state?.success ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MailCheck className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              If an account exists for{" "}
              <span className="font-medium text-foreground">{state.values?.email}</span>, we&apos;ve
              sent a link to reset your password. The link expires in 1 hour.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
              Forgot password?
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form action={formAction} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state?.values?.email}
              />
              {state?.fieldErrors?.email?.[0] ? (
                <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
              ) : null}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </motion.div>
  );
}
