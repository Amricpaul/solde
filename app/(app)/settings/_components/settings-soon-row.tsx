"use client";

import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

/**
 * A settings row for a feature that isn't built yet — taps show a toast.
 * `icon` is a rendered element (e.g. `<Bell />`) rather than a component type,
 * because component references can't cross the server→client boundary.
 */
export function SettingsSoonRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => toast(`${label} is coming soon`)}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground [&_svg]:size-[1.1rem]">
        {icon}
      </span>
      <span className="flex-1 truncate text-[0.95rem] font-medium">{label}</span>
      {value ? <span className="shrink-0 text-sm text-muted-foreground">{value}</span> : null}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
