# Solde — System Architecture Document

> Architecture for **Solde**, a personal-finance app (income/expense tracking,
> budgeting, dashboard). Single-user accounts, mobile-first, cloud-synced.

- **Status:** Draft
- **Last updated:** 2026-06-25
- **Owner:** amricpaul@gmail.com
- **Related docs:** [Product Requirements](./product-requirements-document.md) · [Infrastructure & Deployment](./infrastructure-deployment-strategy.md)

---

## 1. Architecture overview

Solde is a **modular monolith**: a single full-stack Next.js 16 (App Router)
application backed by MongoDB. For a single-user MVP, microservices would be pure
overhead — instead we keep clean module boundaries *inside* one deployable and split a
piece out only when it genuinely needs to scale or isolate (the prime future candidate
is receipt OCR).

```
                 ┌─────────────────────────────────────────────┐
   Browser /     │            Next.js 16 (App Router)           │
   installed PWA │                                              │
  ┌───────────┐  │  ┌────────────────┐    ┌──────────────────┐ │
  │  React 19 │  │  │ Server          │    │ Route Handlers   │ │
  │ shadcn/ui │◄─┼─►│ Components      │    │ app/api/*        │ │
  │ (client   │  │  │ (reads)         │    │ export | cron |  │ │
  │  islands) │  │  └────────────────┘    │ auth             │ │
  └───────────┘  │  ┌────────────────┐    └──────────────────┘ │
                 │  │ Server Actions │                          │
                 │  │ (writes)       │     ┌──────────────────┐ │
                 │  └───────┬────────┘     │ Domain modules   │ │
                 │          └──────────────► transactions     │ │
                 │                         │ budgets | goals  │ │
                 │  ┌────────────────┐     │ auth | dashboard │ │
                 │  │ lib/db (cached │◄────┤ (model/service/  │ │
                 │  │ Mongoose conn) │     │  schema)         │ │
                 │  └───────┬────────┘     └──────────────────┘ │
                 └──────────┼───────────────────────────────────┘
                            ▼
                 ┌──────────────────────┐      ┌──────────────────┐
                 │  MongoDB (Atlas)     │      │ External (later) │
                 │  source of truth +   │      │ FX rates · OCR · │
                 │  backups + sync      │      │ push/email       │
                 └──────────────────────┘      └──────────────────┘
```

## 2. Technology stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Breaking changes vs. older Next — read `node_modules/next/dist/docs/` before coding (see AGENTS.md). |
| UI runtime | React 19 + TypeScript (strict) | Server Components by default; client islands for interactivity. |
| Styling | Tailwind CSS v4 + shadcn/ui (`base-nova`, `@base-ui/react`) | OKLCH CSS-variable theme in `app/globals.css`; `cn()` in `lib/utils`. |
| Database | MongoDB via Mongoose | `MONGODB_URI` in `.env`. Single cached connection. |
| Auth | Auth.js (NextAuth v5) + MongoDB adapter + WebAuthn/passkeys | Passkeys deliver the Face ID / fingerprint requirement on the web. |
| Validation | Zod | At every server write boundary. |
| Delivery | PWA (installable, offline-read cache) | Meets multi-device + biometric without a native app. |

## 3. Layered design

| Layer | Responsibility | Implementation |
|---|---|---|
| **Presentation** | Render UI, capture input | React Server Components for reads; client components for forms, charts, theme toggle. shadcn/ui in `components/ui/`. |
| **Mutations** | Internal state changes | **Server Actions** (add/edit/delete transaction, set budget, contribute to goal). Type-safe, no hand-written endpoint. |
| **Public API** | Surfaces that need REST | **Route Handlers** (`app/api/*`) only for: CSV/PDF export, cron jobs, auth, future mobile/3rd-party. Keep this surface small. |
| **Domain** | Business rules | Feature modules, each owning `model.ts` + `service.ts` + `schema.ts`. Logic stays out of components. |
| **Data** | Persistence | Mongoose models + a single cached connection in `lib/db`. Aggregation pipelines for dashboard/budget rollups. |
| **Cross-cutting** | Auth, money math, FX, logging | `lib/auth`, `lib/money`, etc. Server-only. |

## 4. Proposed code structure

Import alias `@/*` maps to the repo root (no `src/`). App code lives in `app/`.

```
app/
  (auth)/login, register
  (app)/dashboard, transactions, budgets, goals, settings   ← protected route group
  api/
    export/        ← CSV / PDF streaming download
    cron/[job]/    ← reminders, recurring materialization (secret-protected)
    auth/          ← Auth.js handlers
modules/
  transactions/  { model.ts  service.ts  schema.ts  components/ }
  budgets/
  dashboard/
  goals/
  auth/
lib/
  db/      ← cached Mongoose connection (survives dev hot-reload)
  money/   ← minor-unit math, currency, FX conversion
  auth/    ← session helpers, passkey config
components/ui/   ← shadcn/ui primitives
app/globals.css  ← OKLCH theme tokens (:root + .dark)
```

## 5. Data model (MongoDB collections)

| Collection | Key fields | Notes |
|---|---|---|
| `users` | email, name, baseCurrency, theme pref, timestamps | One per account. |
| `credentials` | userId, passkey/WebAuthn public key, password hash | Supports password + biometric passkeys. |
| `categories` | userId, name, type (income\|expense), icon/color | Seeded defaults (groceries, rent, salary…). |
| `transactions` | userId, type, **amountMinor (int)**, currency, categoryId, date, note | The core ledger. Indexed by `{ userId, date }`. |
| `budgets` | userId, categoryId, month, **limitMinor (int)** | One per category per month. Spend derived by aggregation. |
| `goals` *(L1)* | userId, name, **targetMinor**, **savedMinor**, deadline? | Saving buckets. |
| `recurring` *(L5)* | userId, template (amount/category/currency), cadence, nextRun | Materialized by cron. |
| `reminders` *(L3)* | userId, label, dueDate, channel, sent? | Evaluated by cron. |
| `fxRates` *(L2)* | base, quote, rate, fetchedAt | Cached daily; conversions computed at read time. |

**Money rule:** every monetary value is an **integer in minor units** (cents/fils) plus an
ISO-4217 currency code. No floating-point anywhere; format only at the UI edge.

## 6. Key flows

- **Add transaction (M2):** client form → Server Action → Zod validate → insert →
  `revalidatePath` dashboard/history. Balance reflects immediately.
- **Dashboard (M1):** Server Component runs aggregation pipelines (month income, month
  expense, total balance, recent transactions, per-category spend) in parallel.
- **Budget progress (M3):** aggregate month's expense transactions per category; compare to
  `limitMinor`; render progress bars, flag at/over limit.
- **History (M4):** paginated, newest-first, server-side search + filter (date/type/category/amount),
  backed by the `{ userId, date }` index.
- **Auth (M5):** Auth.js session in httpOnly cookie; protected `(app)` group redirects
  unauthenticated users; passkey registration enables biometric unlock.
- **Export (X1):** Route Handler streams CSV; PDF generated on demand.
- **Cloud sync (X2):** MongoDB is the single source of truth; every device reads/writes via
  the app, so sync is inherent; Atlas backups protect the data.
- **Scheduled (L3/L5):** `/api/cron/[job]` (secret-protected) materializes recurring
  transactions and dispatches reminders.

## 7. Cross-cutting concerns

- **Security:** httpOnly session cookies; Zod validation on every write; rate-limited auth;
  least-privilege DB user; secrets in `.env` only; CSRF protection on actions.
- **Performance:** indexes on hot query paths (`transactions {userId,date}`,
  `budgets {userId,month}`); aggregation over denormalized counters for MVP volumes; RSC to
  minimize client JS.
- **Accessibility:** WCAG AA contrast in both themes (note: `primary-foreground` is dark
  because white fails contrast on the flame orange); keyboard navigation; semantic markup.
- **Reliability:** managed Atlas backups; idempotent cron jobs (guard on `nextRun`/`sent`).

## 8. Module-extraction candidates (future)

Kept in the monolith for now, designed to be liftable later:
- **Receipt OCR (L4)** — image upload → OCR → draft transaction; async and compute-heavy,
  the most likely first extraction (worker or separate service).
- **Notifications (L3)** — push/email dispatch could move to a queue + worker.

## 9. Decisions to confirm (see infra doc)

- Deployment target: managed (Vercel + Atlas) vs. self-hosted container. `.env` includes
  `PORT`/`APP_URL`, hinting at self-host — which also changes how cron is scheduled.
- Reminder channel: web push, email, or both.
- Receipt OCR: self-hosted (Tesseract) vs. cloud vision API / vision LLM.
