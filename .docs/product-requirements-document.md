# Solde — Product Requirements Document

> **Solde** (French: *balance*) is a personal finance app for tracking income,
> expenses, and budgets, with a clear at-a-glance dashboard.

- **Status:** Draft
- **Last updated:** 2026-06-25
- **Owner:** amric@imccertifications.com
- **Related docs:** [System Architecture](./system-architecture-document.md) · [Infrastructure & Deployment](./infrastructure-deployment-strategy.md)

---

## 1. Overview

Solde helps an individual understand and control their money. The user records what
they earn and spend, sets monthly budgets per category, and sees how much is left to
spend. Data is synced to the cloud so it is backed up and available across devices.

## 2. Goals & Non-Goals

**Goals**
- Give a trustworthy, at-a-glance picture of personal finances.
- Make daily expense/income entry fast (low-friction manual entry).
- Help the user stay within self-set monthly budgets.
- Keep financial data private, secure, and backed up.

**Non-Goals (for now)**
- Bank account aggregation / open-banking sync (no Plaid-style imports in MVP).
- Investment portfolio tracking, tax filing, or accounting/ledgers for businesses.
- Shared / multi-user household budgets (single-user accounts only at launch).

## 3. Target User

A working individual who wants to track day-to-day money manually, set simple budgets,
and occasionally review history — primarily on mobile, sometimes on desktop. May deal
with more than one currency (e.g. AED plus others) for travel or cross-border spending.

---

## 4. Scope

### 4.1 Core MVP — Must-Haves

| # | Feature | Requirement |
|---|---------|-------------|
| M1 | **Simple Dashboard** | A clear at-a-glance snapshot of total balance, recent income, and monthly expenses. |
| M2 | **Expense & Income Tracking** | Quick manual entry for daily spending and earnings, organized by simple categories (groceries, rent, salary, …). |
| M3 | **Basic Budgeting** | Set monthly limits per category; show visual progress bars indicating how much is left to spend. |
| M4 | **Transaction History** | A searchable, chronological list of all past activity with easy filtering. |
| M5 | **Secure Authentication** | Standard login; biometric support (Face ID / fingerprint) where the device allows. |
| M6 | **Dark Mode** | A clean, high-contrast dark theme for nighttime visibility. |

### 4.2 Smart Features — Later

| # | Feature | Requirement |
|---|---------|-------------|
| L1 | **Goal Setting** | Dedicated "saving buckets" with progress tracking toward specific targets (e.g. wedding fund, new monitor). |
| L2 | **Multi-Currency Support** | Track expenses in AED alongside other currencies; toggle for travel / cross-border. |
| L3 | **Bill Reminders** | Push / email alerts for upcoming due dates (rent, utilities, subscriptions) to avoid late fees. |
| L4 | **Receipt Scanning** | Camera integration that extracts total amount and date from physical receipts automatically. |
| L5 | **Recurring Transactions** | Automated logging for fixed monthly costs (Netflix, gym, …). |

### 4.3 Experience & Security (cross-cutting)

| # | Feature | Requirement |
|---|---------|-------------|
| X1 | **Data Export** | Download financial history as CSV or PDF for personal records / taxes. |
| X2 | **Cloud Sync** | Data is safely backed up and accessible across multiple devices. |

---

## 5. Functional Requirements (detail)

### 5.1 Dashboard (M1)
- Show **total balance** (income − expenses across all accounts), **income this month**, **expenses this month**.
- Show recent transactions (latest 5–10) and per-category budget progress.
- Default time window = current month; balances update immediately after an entry.

### 5.2 Transactions (M2, M4)
- Create / edit / delete a transaction with: type (income | expense), amount, currency, category, date, note.
- Amounts are stored as **integer minor units** (e.g. cents/fils) + ISO-4217 currency code — never floating-point.
- History is paginated, sorted newest-first, **searchable** (note/category) and **filterable** (date range, type, category, amount range).

### 5.3 Budgets (M3)
- Set a monthly limit per category.
- Progress bar = (spent in category this month / limit); visually flag at/over limit.
- Spend is derived by aggregating that month's expense transactions per category.

### 5.4 Authentication (M5)
- Email + password sign-up / sign-in with secure session handling.
- Optional **passkey / WebAuthn** credential enabling Face ID / fingerprint unlock on supported devices.
- Sessions via httpOnly cookies; protected routes redirect unauthenticated users.

### 5.5 Dark Mode (M6)
- Light + dark themes using the brand palette (see CLAUDE.md). User toggle; respects system preference by default.

### 5.6 Later features
- **Goals (L1):** create a target amount + optional deadline; contribute funds; track progress.
- **Multi-currency (L2):** per-transaction currency; a user base/display currency; FX rates fetched from a provider and cached; conversions computed for display.
- **Bill reminders (L3):** scheduled job evaluates upcoming due dates and sends push/email alerts.
- **Receipt scanning (L4):** upload image → OCR extracts amount + date → pre-filled draft transaction for confirmation.
- **Recurring (L5):** define cadence (monthly, etc.); a scheduled job materializes the transaction on schedule.

### 5.7 Data export (X1) & Cloud sync (X2)
- Export filtered history to CSV and PDF (server-generated, streamed download).
- Server (MongoDB) is the source of truth; all devices read/write through the API, giving inherent multi-device sync; managed backups protect the data.

---

## 6. Non-Functional Requirements

- **Accuracy:** monetary math is exact (integer minor units; no float drift).
- **Security & privacy:** httpOnly cookies, input validation on every write, rate-limited auth, least-privilege DB access, secrets in env only.
- **Performance:** dashboard interactive in < 2s on a typical mobile connection; common queries backed by indexes.
- **Availability:** cloud-hosted with automated backups; data recoverable.
- **Accessibility:** WCAG AA contrast in both themes; keyboard-navigable; semantic markup.
- **Responsive:** mobile-first; usable on desktop.

## 7. Success Metrics

- Time to log a transaction < 10 seconds.
- A user can set up all category budgets in one sitting (< 5 min).
- Weekly active return rate (user comes back to log/check).

## 8. Release Phasing

- **Phase 1 (MVP):** M1–M6 + X2 (basic cloud sync via hosted DB).
- **Phase 2:** L1 (goals), L2 (multi-currency), X1 (export), sync hardening.
- **Phase 3:** L3 (reminders), L5 (recurring), L4 (receipt scanning).

## 9. Open Questions

- Deployment target: managed (Vercel + MongoDB Atlas) vs. self-hosted container? (`.env` includes `PORT`/`APP_URL`, hinting at self-host.)
- Notification channel for bill reminders: web push, email, or both?
- Receipt OCR: self-hosted (Tesseract) vs. cloud vision API / vision LLM?
