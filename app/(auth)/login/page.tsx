import { loginAction } from "@/modules/auth/actions";
import { AuthForm } from "@/modules/auth/components/auth-form";
import { PasskeySignInButton } from "@/modules/auth/components/passkey-buttons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
  const notice =
    reset === "success"
      ? "Your password has been updated. Sign in with your new password."
      : undefined;

  return (
    <AuthForm mode="login" action={loginAction} notice={notice}>
      <div className="relative my-1 flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border" />
      </div>
      <PasskeySignInButton />
    </AuthForm>
  );
}
