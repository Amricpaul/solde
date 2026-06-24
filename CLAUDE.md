@AGENTS.md

# Solde

**Solde** (French: *balance*) is a personal-finance app for tracking income, expenses,
and budgets, with an at-a-glance dashboard. Single-user accounts, mobile-first, cloud-synced.

Full requirements: [.docs/product-requirements-document.md](.docs/product-requirements-document.md).
Architecture: [.docs/system-architecture-document.md](.docs/system-architecture-document.md).
Infra: [.docs/infrastructure-deployment-strategy.md](.docs/infrastructure-deployment-strategy.md).

## Tech stack

- **Next.js 16** (App Router, Turbopack) — see the NOT-the-Next.js-you-know note in AGENTS.md.
- **React 19**, **TypeScript** (strict).
- **Tailwind CSS v4** + **shadcn/ui** (`base-nova` style, `@base-ui/react` primitives). `cn()` in `lib/utils`.
- **MongoDB** (`MONGODB_URI` in `.env`) — the source of truth and the cloud-sync/backup layer.
- Import alias `@/*` maps to the repo root (no `src/` dir). App code lives in `app/`.

## Product scope

**MVP (must-haves):** dashboard (total balance / income / expenses), expense & income
tracking by category, per-category monthly budgets with progress bars, searchable +
filterable transaction history, secure auth (with biometric where available), dark mode.

**Later:** saving-goal buckets, multi-currency (AED + others), bill reminders, receipt
scanning (OCR), recurring transactions.

**Cross-cutting:** CSV/PDF data export, cloud sync across devices.

## Engineering conventions

- **Money is never a float.** Store amounts as **integer minor units** (cents/fils) plus an
  ISO-4217 currency code. Do all math in minor units; format only at the edges.
- **Feature-first layout.** Group code by domain (transactions, budgets, dashboard, goals,
  auth) rather than by technical type. shadcn components stay in `components/ui/`.
- **Reads in Server Components; writes via Server Actions / Route Handlers.** Keep secrets
  and DB access server-only.
- **One MongoDB connection.** Use a cached/singleton client to survive dev hot-reload — never
  open a connection per request.
- **Validate every write** (e.g. Zod) at the server boundary before it touches the DB.
- **Theme:** brand palette in `app/globals.css` (OKLCH CSS variables, `:root` + `.dark`).
  Palette: `#FFFCF2` floral white · `#CCC5B9` timberwolf · `#403D39` black olive ·
  `#252422` raisin black · `#EB5E28` flame (primary/brand). `primary-foreground` is dark
  on purpose — white fails WCAG contrast on the flame orange.

## Commands

- `pnpm dev` — dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint

This project uses **pnpm**. Add UI components with `pnpm dlx shadcn@latest add <name>`.
