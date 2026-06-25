"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "./schema";
import { createUser, EmailInUseError, verifyPassword } from "./service";

export interface AuthFormState {
  error?: string;
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
  redirect("/dashboard"); // throws — must be outside the try/catch above
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
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
