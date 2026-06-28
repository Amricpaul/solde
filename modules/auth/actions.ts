"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, deleteSession } from "@/lib/auth/session";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./schema";
import {
  createPasswordResetToken,
  createUser,
  EmailInUseError,
  resetPasswordWithToken,
  verifyPassword,
} from "./service";

export interface AuthFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
  values?: { name?: string; email?: string };
}

export async function registerAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") },
    };
  }

  let userId: string;
  try {
    userId = await createUser(parsed.data);
  } catch (err) {
    if (err instanceof EmailInUseError) {
      return { error: err.message, values: { name: parsed.data.name, email: parsed.data.email } };
    }
    throw err;
  }

  await createSession(userId);
  redirect("/"); // throws — must be outside the try/catch above
}

export async function loginAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: { email: String(formData.get("email") ?? "") },
    };
  }

  const userId = await verifyPassword(parsed.data);
  if (!userId) {
    return { error: "Invalid email or password", values: { email: parsed.data.email } };
  }

  await createSession(userId);
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: { email: String(formData.get("email") ?? "") },
    };
  }

  const result = await createPasswordResetToken(parsed.data.email);
  if (result) {
    const url = `${process.env.APP_URL}/reset-password?token=${result.token}`;
    await sendPasswordResetEmail({ to: parsed.data.email, url });
  }

  // Always report success — never reveal whether an account exists.
  return { success: true, values: { email: parsed.data.email } };
}

export async function resetPasswordAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const ok = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!ok) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  redirect("/login?reset=success");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
