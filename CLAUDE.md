# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # start Vite dev server
npm run build           # type-check (tsc -b) then production build
npm run lint             # oxlint
npm run preview          # preview production build
npm run test              # run vitest once
npm run test:watch        # vitest watch mode
npm run test:coverage     # vitest with coverage
```

To run a single test file: `npx vitest run <path-to-file>`. To run tests matching a name: `npx vitest run -t "<pattern>"`.

There is no test setup file or vitest config yet (`vitest`, `jsdom`, `@testing-library/*` are installed as devDependencies but unused so far) — the first test added will need to wire up `vitest.config.ts` / jsdom environment.

## Architecture

This is a personal finance ("wealth") tracker: React 19 + TypeScript + Vite, Tailwind v4 (via `@tailwindcss/vite`, no `tailwind.config.js`), React Router v7, Zustand for state, Supabase as the backend (optional/not yet wired to real data).

### Data flow is currently mock-backed, one layer at a time

- `src/mocks/wealth.mock.ts` — hardcoded seed data (settings, budget categories, goals, transactions, assets, liabilities, monthly reviews).
- `src/services/wealth/wealth.service.ts` — `wealthService.getDashboardSnapshot()` is meant to be the real data-fetch boundary; it currently returns the same mock data whether or not Supabase is configured, since no live queries have been implemented yet. This is the file to extend when wiring Supabase queries.
- `src/stores/wealthStore.ts` — Zustand store seeded directly from the mocks (not from the service yet). Holds `settings`, `budgetCategories`, `goals`, `transactions`, `assets`, `liabilities`, `monthlyReviews` plus setters.
- `src/hooks/wealth/useWealthSnapshot.ts` — the hook pages should actually consume. Wraps `useWealthStore` and derives `monthlyIncome`, `activeExchangeRate` (manual rate if enabled, else `cachedExchangeRate`), `transactionSummary`, and `netWorth` via `src/helpers/wealthCalculations.ts`. Any new derived/computed financial metric belongs in `wealthCalculations.ts` and should be surfaced through this hook, not recomputed in components.
- `src/services/supabase/client.ts` — exports `supabase` (nullable) and `isSupabaseConfigured`, gated on `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` env vars. Code that touches Supabase must handle the `supabase === null` case (unconfigured/local dev).

When adding a real backend-fed feature, the intended path is: Supabase query in `wealth.service.ts` → loaded into `wealthStore.ts` → derived/shaped in `useWealthSnapshot.ts` (or a new hook alongside it) → consumed by page components. Don't have page components read `wealth.mock.ts` or the service directly.

### Currency handling

All monetary values carry a `CurrencyCode` (`src/models/wealth/types.ts`). There's a distinction between a user's `earningCurrency` and `spendingCurrency`, with conversion via `activeExchangeRate` (manual override or cached rate). Use `formatCurrency`/`formatCompactCurrency`/`convertCurrency` from `src/helpers/currencyHelpers.ts` rather than formatting numbers inline — note `NGN` is special-cased to 0 fraction digits.

### Routing & layout

- Routes are centralized in `src/constants/routes.ts` (a plain object of path strings) and consumed in `src/App.tsx`'s `createBrowserRouter` tree — add new routes in both places.
- `src/routeguard/privateroute.tsx` is the auth gate wrapping all authenticated routes; it currently just renders `<Outlet />` with no real auth check.
- `src/pages/layout/Root.layout.tsx` is the authenticated shell (`Sidebar` + `Header` + `BottomNav` from `src/pages/partials/`, re-exported via `src/pages/partials/index.ts`).
- Pages live in `src/pages/wealth/*` (one file per route: dashboard, budget, goals, transactions, net-worth, monthly-reviews, settings) and `src/pages/auth/login.tsx`.

### Component conventions

Shared UI lives under `src/component/<domain>/<file>.tsx` with lowercase, dot-separated filenames (e.g. `data.table.tsx`, `authinput.tsx`, `statusbadge.tsx`), default exports, and a variant-map pattern (plain objects like `variants`/`padding`/`radii` keyed by prop, e.g. `src/component/buttons/button.tsx`). Feature-specific components (e.g. dashboard-only cards) live under `src/component/wealth/<feature>/`. Use `Text` (`src/component/typography/typography.tsx`) instead of raw `<p>`/heading tags for consistent sizing. Icons go through `src/component/icon/icons.tsx` (`<Icon name="..." />`), not direct `lucide-react` imports in feature code.

Styling is Tailwind utility classes inline (slate/teal palette), no CSS modules or styled-components.
