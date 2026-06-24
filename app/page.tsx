import { Button } from "@/components/ui/button";

const swatches = [
  { name: "Floral white", hex: "#FFFCF2", className: "bg-background text-foreground" },
  { name: "Timberwolf", hex: "#CCC5B9", className: "bg-secondary text-secondary-foreground" },
  { name: "Black olive", hex: "#403D39", className: "bg-muted-foreground text-background" },
  { name: "Raisin black", hex: "#252422", className: "bg-foreground text-background" },
  { name: "Flame", hex: "#EB5E28", className: "bg-primary text-primary-foreground" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 bg-background px-6 py-24 font-sans text-foreground">
      <div className="flex w-full max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">shadcn/ui is installed</h1>
        <p className="text-muted-foreground">
          Themed with your{" "}
          <a className="text-primary underline-offset-4 hover:underline" href="https://coolors.co/fffcf2-ccc5b9-403d39-252422-eb5e28">
            coolors palette
          </a>
          . Toggle the <code className="font-mono">dark</code> class on{" "}
          <code className="font-mono">&lt;html&gt;</code> to preview dark mode.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
        {swatches.map((s) => (
          <div
            key={s.hex}
            className={`flex h-24 flex-col justify-end rounded-lg border border-border p-3 ${s.className}`}
          >
            <span className="text-xs font-medium">{s.name}</span>
            <span className="font-mono text-xs opacity-70">{s.hex}</span>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-2xl flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
    </main>
  );
}
