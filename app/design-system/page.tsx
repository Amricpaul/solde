import type { Metadata } from "next";
import { ArrowRight, Plus, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Design System — Solde",
  description: "Colors, typography, spacing, and components used across Solde.",
};

/* ---------------------------------- data ---------------------------------- */

// Semantic theme tokens. Class strings are written as full literals so Tailwind's
// scanner picks them up.
const semanticColors: { name: string; className: string; muted?: boolean }[] = [
  { name: "background / foreground", className: "bg-background text-foreground" },
  { name: "card / card-foreground", className: "bg-card text-card-foreground" },
  { name: "popover / popover-foreground", className: "bg-popover text-popover-foreground" },
  { name: "primary / primary-foreground", className: "bg-primary text-primary-foreground" },
  { name: "secondary / secondary-foreground", className: "bg-secondary text-secondary-foreground" },
  { name: "muted / muted-foreground", className: "bg-muted text-muted-foreground" },
  { name: "accent / accent-foreground", className: "bg-accent text-accent-foreground" },
  { name: "destructive", className: "bg-destructive text-white" },
];

const lineColors = [
  { name: "border", className: "border-4 border-border bg-card" },
  { name: "input", className: "border-4 border-input bg-card" },
  { name: "ring", className: "border-4 border-ring bg-card" },
];

const charts = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const brand = [
  { name: "Floral white", hex: "#FFFCF2" },
  { name: "Timberwolf", hex: "#CCC5B9" },
  { name: "Black olive", hex: "#403D39" },
  { name: "Raisin black", hex: "#252422" },
  { name: "Flame", hex: "#EB5E28" },
];

const typeScale = [
  { cls: "text-4xl font-semibold tracking-tight", label: "text-4xl / semibold" },
  { cls: "text-3xl font-semibold tracking-tight", label: "text-3xl / semibold" },
  { cls: "text-2xl font-semibold", label: "text-2xl / semibold" },
  { cls: "text-xl font-medium", label: "text-xl / medium" },
  { cls: "text-lg font-medium", label: "text-lg / medium" },
  { cls: "text-base", label: "text-base / normal" },
  { cls: "text-sm", label: "text-sm / normal" },
  { cls: "text-xs", label: "text-xs / normal" },
];

// "Old school" serif candidates for a finance app — loaded in app/layout.tsx.
const oldSchoolFonts = [
  {
    name: "Libre Baskerville",
    cls: "font-baskerville",
    utility: "font-baskerville",
    note: "Transitional serif — trustworthy, classic banking.",
  },
  {
    name: "Playfair Display",
    cls: "font-playfair",
    utility: "font-playfair",
    note: "High-contrast display serif — premium, private-banking feel.",
  },
  {
    name: "EB Garamond",
    cls: "font-garamond",
    utility: "font-garamond",
    note: "Old-style Garamond — heritage, established institution.",
  },
];

const weights = [
  { cls: "font-normal", label: "normal 400" },
  { cls: "font-medium", label: "medium 500" },
  { cls: "font-semibold", label: "semibold 600" },
  { cls: "font-bold", label: "bold 700" },
];

const spacing = [1, 2, 3, 4, 6, 8, 12, 16, 24];

const radii = [
  { name: "sm", cls: "rounded-sm" },
  { name: "md", cls: "rounded-md" },
  { name: "lg", cls: "rounded-lg" },
  { name: "xl", cls: "rounded-xl" },
  { name: "2xl", cls: "rounded-2xl" },
  { name: "3xl", cls: "rounded-3xl" },
];

/* ------------------------------- primitives ------------------------------- */

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

/* ---------------------------------- page ---------------------------------- */

export default function DesignSystemPage() {
  const sections = [
    ["colors", "Colors"],
    ["typography", "Typography"],
    ["typefaces", "Typefaces"],
    ["spacing", "Spacing"],
    ["radius", "Radius"],
    ["buttons", "Buttons"],
    ["inputs", "Form controls"],
    ["tabs", "Tabs"],
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">Solde</p>
            <h1 className="text-4xl font-semibold tracking-tight">Design System</h1>
          </div>
          <ModeToggle />
        </div>
        <p className="max-w-prose text-muted-foreground">
          The tokens and components that make up the Solde interface. Use the toggle to
          preview light, dark, and system themes.
        </p>
        <nav className="flex flex-wrap gap-2 pt-2">
          {sections.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <div className="space-y-16">
        {/* Colors */}
        <Section id="colors" title="Colors" description="Semantic tokens drive every component; the brand palette underpins them.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {semanticColors.map((c) => (
              <div
                key={c.name}
                className={cn(
                  "flex h-20 flex-col justify-between rounded-lg border border-border p-3",
                  c.className,
                )}
              >
                <span className="text-xs font-medium opacity-90">Aa</span>
                <span className="font-mono text-xs">{c.name}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Lines</p>
            <Row>
              {lineColors.map((l) => (
                <div key={l.name} className="flex flex-col items-center gap-1.5">
                  <div className={cn("size-12 rounded-lg", l.className)} />
                  <span className="font-mono text-xs text-muted-foreground">{l.name}</span>
                </div>
              ))}
            </Row>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Charts</p>
            <Row>
              {charts.map((c, i) => (
                <div key={c} className="flex flex-col items-center gap-1.5">
                  <div className={cn("size-12 rounded-lg border border-border", c)} />
                  <span className="font-mono text-xs text-muted-foreground">chart-{i + 1}</span>
                </div>
              ))}
            </Row>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Brand palette</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {brand.map((b) => (
                <div key={b.hex} className="overflow-hidden rounded-lg border border-border">
                  <div className="h-14" style={{ backgroundColor: b.hex }} />
                  <div className="space-y-0.5 p-2">
                    <p className="text-xs font-medium">{b.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{b.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Typography */}
        <Section id="typography" title="Typography" description="Geist Sans for UI, Geist Mono for code and figures.">
          <div className="space-y-3 rounded-lg border border-border p-5">
            {typeScale.map((t) => (
              <div key={t.label} className="flex items-baseline justify-between gap-4">
                <span className={cn("truncate", t.cls)}>The quick brown fox</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {weights.map((w) => (
              <div key={w.label} className="rounded-lg border border-border p-4">
                <p className={cn("text-lg", w.cls)}>Solde</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{w.label}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            font-mono · AED 1,250.00 · 0123456789
          </p>
        </Section>

        {/* Typefaces */}
        <Section
          id="typefaces"
          title="Typefaces"
          description="Old-school serif candidates that suit a finance product. Each preview uses real figures so you can judge how numerals read."
        >
          <div className="space-y-4">
            {oldSchoolFonts.map((f) => (
              <div key={f.name} className="rounded-lg border border-border p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">{f.name}</span>
                  <code className="font-mono text-xs text-muted-foreground">{f.utility}</code>
                </div>
                <div className={cn("space-y-3", f.cls)}>
                  <p className="text-3xl leading-tight font-bold tracking-tight">
                    Statement of Account
                  </p>
                  <p className="text-2xl">Total balance — AED&nbsp;12,480.50</p>
                  <p className="text-base text-muted-foreground">
                    Track income and expenses with confidence. 1234567890 · $1,250.00 · €980.75 · ₹64,200
                  </p>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Spacing */}
        <Section id="spacing" title="Spacing" description="Based on a 4px (0.25rem) unit. The same scale governs padding, gap, and margin.">
          <div className="space-y-2.5">
            {spacing.map((n) => (
              <div key={n} className="flex items-center gap-4">
                <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
                  {n} · {n * 4}px
                </span>
                <div className="h-4 rounded-sm bg-primary" style={{ width: `${n * 0.25}rem` }} />
              </div>
            ))}
          </div>
        </Section>

        {/* Radius */}
        <Section id="radius" title="Radius" description="Derived from the --radius token in globals.css.">
          <Row>
            {radii.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-1.5">
                <div className={cn("size-16 border border-border bg-muted", r.cls)} />
                <span className="font-mono text-xs text-muted-foreground">{r.name}</span>
              </div>
            ))}
          </Row>
        </Section>

        {/* Buttons */}
        <Section id="buttons" title="Buttons" description="Variants, sizes, and states from components/ui/button.">
          <div className="space-y-4 rounded-lg border border-border p-5">
            <div>
              <p className="mb-2 text-sm font-medium">Variants</p>
              <Row>
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </Row>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Sizes</p>
              <Row>
                <Button size="xs">Extra small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </Row>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">With icons</p>
              <Row>
                <Button>
                  <Plus />
                  New transaction
                </Button>
                <Button variant="outline">
                  Continue
                  <ArrowRight />
                </Button>
                <Button variant="destructive">
                  <Trash2 />
                  Delete
                </Button>
              </Row>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Icon only &amp; states</p>
              <Row>
                <Button size="icon-sm" variant="outline" aria-label="Settings">
                  <Settings />
                </Button>
                <Button size="icon" variant="outline" aria-label="Settings">
                  <Settings />
                </Button>
                <Button size="icon-lg" variant="outline" aria-label="Settings">
                  <Settings />
                </Button>
                <Button disabled>Disabled</Button>
              </Row>
            </div>
          </div>
        </Section>

        {/* Form controls */}
        <Section id="inputs" title="Form controls" description="Inputs and labels share the same focus ring and border tokens.">
          <div className="grid max-w-sm gap-4 rounded-lg border border-border p-5">
            <div className="space-y-1.5">
              <Label htmlFor="ds-email">Email</Label>
              <Input id="ds-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-amount">Amount</Label>
              <Input id="ds-amount" inputMode="decimal" placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-disabled">Disabled</Label>
              <Input id="ds-disabled" disabled placeholder="Unavailable" />
            </div>
          </div>
        </Section>

        {/* Tabs */}
        <Section id="tabs" title="Tabs" description="Two variants — default (segmented) and line.">
          <div className="space-y-6 rounded-lg border border-border p-5">
            <div>
              <p className="mb-2 text-sm font-medium">Default</p>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-3 text-muted-foreground">
                  A snapshot of balance, income, and spend.
                </TabsContent>
                <TabsContent value="activity" className="pt-3 text-muted-foreground">
                  Your recent transactions appear here.
                </TabsContent>
                <TabsContent value="settings" className="pt-3 text-muted-foreground">
                  Preferences and account options.
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Line</p>
              <Tabs defaultValue="month" className="w-full">
                <TabsList variant="line">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
                <TabsContent value="week" className="pt-3 text-muted-foreground">
                  Last 7 days.
                </TabsContent>
                <TabsContent value="month" className="pt-3 text-muted-foreground">
                  This calendar month.
                </TabsContent>
                <TabsContent value="year" className="pt-3 text-muted-foreground">
                  Year to date.
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
