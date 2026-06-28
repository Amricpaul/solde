import "server-only";

interface PasswordResetEmail {
  to: string;
  url: string;
}

/**
 * Sends the password-reset email.
 *
 * No email provider is wired up yet, so in development we log the link to the
 * server console (grab it from there to complete the flow locally). To enable
 * real delivery, install a provider and replace the body below, e.g. Resend:
 *
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({
 *     from: "Solde <no-reply@yourdomain>",
 *     to,
 *     subject: "Reset your Solde password",
 *     html: `<p>Reset your password:</p><p><a href="${url}">${url}</a></p>`,
 *   });
 */
export async function sendPasswordResetEmail({ to, url }: PasswordResetEmail): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[email] Password reset link for ${to}:\n${url}\n`);
    return;
  }
  // Production without a provider: warn loudly rather than fail silently.
  console.warn(`[email] No email provider configured — reset link for ${to} was not delivered.`);
}
