import { loginAction } from "@/modules/auth/actions";
import { AuthForm } from "@/modules/auth/components/auth-form";
import { PasskeySignInButton } from "@/modules/auth/components/passkey-buttons";

export default function LoginPage() {
  return (
    <AuthForm mode="login" action={loginAction}>
      <div className="relative my-1 flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border" />
      </div>
      <PasskeySignInButton />
    </AuthForm>
  );
}
