import {
  Bell,
  Coins,
  LogOut,
  Plug,
  ShieldCheck,
  SunMoon,
  Tags,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/mode-toggle";
import { requireUser } from "@/lib/auth/dal";
import { logoutAction } from "@/modules/auth/actions";
import { SettingsLinkRow, SettingsControlRow, SettingsSection } from "./_components/settings-list";
import { SettingsSoonRow } from "./_components/settings-soon-row";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-2">
      <h1 className="px-1 text-2xl font-semibold tracking-tight">Settings</h1>

      {/* Profile header */}
      <div className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-foreground text-lg font-semibold text-background">
          {initialsOf(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-5" />
          </Button>
        </form>
      </div>

      <SettingsSection title="General">
        <SettingsSoonRow icon={<UserRound />} label="Edit Profile" />
        <SettingsSoonRow icon={<Coins />} label="App Currency" value={user.baseCurrency} />
        <SettingsControlRow icon={SunMoon} label="Appearance" control={<ThemeToggle />} />
        <SettingsSoonRow icon={<Bell />} label="Notifications" />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsLinkRow href="/settings/security" icon={ShieldCheck} label="Passkeys & sign-in" />
      </SettingsSection>

      <SettingsSection title="Organization">
        <SettingsLinkRow href="/settings/categories" icon={Tags} label="Categories" />
      </SettingsSection>

      <SettingsSection title="Integrations">
        <SettingsSoonRow icon={<Plug />} label="Connected apps" />
      </SettingsSection>

      <p className="px-1 text-center text-xs text-muted-foreground">
        Solde{process.env.APP_VERSION ? ` · v${process.env.APP_VERSION.replace(/^"|"$/g, "")}` : ""}
      </p>
    </div>
  );
}
