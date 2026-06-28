import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight">Invalid reset link</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This password reset link is missing or malformed. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-5 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
