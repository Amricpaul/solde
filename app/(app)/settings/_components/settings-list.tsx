import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** A labelled group of rows rendered as one rounded card (iOS-style list). */
export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5">
        {children}
      </div>
    </section>
  );
}

function RowBody({
  icon: Icon,
  label,
  value,
  trailing,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  trailing: React.ReactNode;
}) {
  return (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
        <Icon className="size-[1.1rem]" />
      </span>
      <span className="flex-1 truncate text-[0.95rem] font-medium">{label}</span>
      {value ? <span className="shrink-0 truncate text-sm text-muted-foreground">{value}</span> : null}
      {trailing}
    </>
  );
}

const ROW = "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors";

/** A row that navigates to another settings page. */
export function SettingsLinkRow({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  return (
    <Link href={href} className={cn(ROW, "hover:bg-muted/50")}>
      <RowBody
        icon={icon}
        label={label}
        value={value}
        trailing={<ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
      />
    </Link>
  );
}

/** A row whose trailing slot holds a control (toggle, dropdown, …) instead of a chevron. */
export function SettingsControlRow({
  icon,
  label,
  control,
}: {
  icon: LucideIcon;
  label: string;
  control: React.ReactNode;
}) {
  return (
    <div className={cn(ROW, "cursor-default")}>
      <RowBody icon={icon} label={label} trailing={<span className="shrink-0">{control}</span>} />
    </div>
  );
}
