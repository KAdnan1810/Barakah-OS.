# Barakah OS

An AI-powered personal finance operating system built for Muslims to manage
wealth according to Islamic finance principles — halal investing, Zakat,
Sadaqah, and interest-free debt tracking, alongside a full personal-finance
toolkit (budgets, accounts, goals, net worth, analytics).

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui (new-york style), Framer Motion |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query |
| Client state | Zustand |
| Charts | Recharts |
| Toasts | Sonner |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Deployment | Vercel (frontend) + Supabase (backend) |

## Design Language

Apple + Notion + Linear: minimal, rounded (`--radius: 0.875rem`), generous
spacing, glassmorphism on elevated surfaces (`.glass`, `.glass-strong`
utilities in `src/styles/globals.css`), full light/dark theming via CSS
variables + `class` strategy. Primary accent is a deep emerald (`--primary`,
also aliased as `--halal`) to keep the "halal/growth" association consistent
across charts and badges; gold is reserved for the Halal Investments /
Zakat surfaces.

## Project Structure

```
src/
  components/
    ui/          # shadcn primitives (button, card, dialog, ...)
    layout/       # Shell, Sidebar, Topbar, PageHeader
    shared/       # Cross-feature composites (StatCard, EmptyState, ...)
  features/
    dashboard/
    expenses/
    income/
    budget/
    accounts/
    goals/
    emergency-fund/
    business-fund/
    investments/
    islamic-finance/
      zakat/
      sadaqah/
      ramadan/
      eid/
    loans/
    emi/
    net-worth/
    analytics/
    ai-assistant/
    auth/
    settings/
    profile/
  hooks/          # App-wide hooks (useDebounce, useMediaQuery, ...)
  services/        # Supabase client, API wrappers, AI service
  types/           # Cross-cutting domain types + generated database.types.ts
  utils/           # currency formatting, date helpers, calculations
  lib/             # cn() and other framework glue
  store/           # Zustand stores (ui-store, filters-store, ...)
  routes/          # Route definitions, guarded routes
  styles/          # globals.css (design tokens)
database/
  migrations/      # SQL migrations, applied in order
  seed/            # Seed data for local dev
  policies/         # Row Level Security policies, one file per table
```

Each feature folder follows the same internal shape
(`components/`, `hooks/`, `api/`, `types/`) so any engineer can predict
where code lives without reading the whole tree.

## Islamic Finance Guardrails

These are enforced in both product copy and the investment module's data
model, not just documentation:
- No interest-based (riba) investment types are representable in the
  `Investment` type — only `gold`, `shariah_mutual_fund`, `shariah_stock`,
  `sukuk`.
- Loans carry an explicit `isInterestFree` flag so conventional interest-
  bearing debt is never silently treated the same as qard hasan.
- The AI Assistant's system prompt (Module 13) will hard-restrict
  investment suggestions to the same four categories.

## Build Status — all 15 modules complete ✅

1. ✅ Folder structure
2. ✅ Database schema — `database/migrations/0001_init.sql` (15 tables, normalized, generated `net_worth` column) + `database/policies/rls.sql` (RLS on every table, auto-provisioning trigger on signup)
3. ✅ Authentication — email + Google via Supabase Auth (`src/features/auth`), demo-mode fallback so the app runs with zero backend setup
4. ✅ Layout — `AppShell`, collapsible `Sidebar`, `Topbar`, light/dark `ThemeToggle`
5. ✅ Dashboard — all stat cards, trend + pie charts, goals, upcoming EMIs, recent transactions, quick add
6. ✅ Expense module — logging, categories, payment methods, search, filters, CSV export
7. ✅ Income module — by-source tracking, totals
8. ✅ Budget module — budget vs actual, inline-editable limits, overspend badges
9. ✅ Accounts — multi-account balances, add account, per-account in/out
10. ✅ Halal Investments — gold / Shariah mutual funds / Shariah stocks / Sukuk only, allocation chart, P/L
11. ✅ Islamic Finance — Zakat calculator (Nisab-based, testable pure function), Sadaqah tracker, Ramadan donation tracker, Eid budget planner
12. ✅ Analytics — 6-month cash flow, category breakdown, financial health score, investment growth
13. ✅ AI Assistant — rule-based, reasons directly over your data (see `src/services/ai.service.ts` for the production upgrade path to a real model via a Supabase Edge Function)
14. ✅ Testing — Vitest configured; unit tests for currency formatting and the Zakat calculation
15. ✅ Deployment — `vercel.json`, GitHub Actions CI (`/.github/workflows/ci.yml`), full `DEPLOYMENT.md`

## Demo mode vs. production

The app is fully interactive out of the box with **no backend required**:
all data lives in a Zustand store (`src/store/app-store.ts`) seeded with
realistic sample data, persisted to `localStorage` so your changes survive a
refresh. Every add/edit action (expenses, income, goals, investments,
Sadaqah, EMI payments...) updates this store immediately, and the dashboard,
budgets, and analytics all react live.

To connect a real backend: fill in `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` in `.env.local` (see `DEPLOYMENT.md`), then swap the
store actions in each feature's flow for real `supabase-js` calls — the
Zustand shapes mirror the SQL schema 1:1 so the swap is mechanical.

## Getting Started

```bash
npm install
cp .env.example .env.local   # optional — omit to run in demo mode
npm run dev                  # http://localhost:5173
```

Sign in with any email/password (demo mode accepts anything) or "Continue
with Google" to explore immediately with sample data.

```bash
npm run test        # run the test suite once
npm run test:watch  # watch mode
npm run typecheck   # strict TS check
npm run lint         # ESLint
npm run build        # production build to dist/
```

# Barakah-OS.
Islamic Personal Finance Operating System

