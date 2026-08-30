# Decisions — Zelkora CMO Dashboard & UI Overhaul

Institutional memory for the overhaul. Each entry records a choice and why it was made, so the
next engineer inherits reasoning rather than a changelog.

## D-cmo-ui-overhaul-1

**A new art direction was adopted for the CMO dashboard and implemented directly, without the
6-stage design pipeline.** The pipeline's store `.claude/.artifacts/design/` (dotted) was
deleted by the user and stays deleted; `validate-manifest.mjs` is therefore permanently out of
the gate set — there is no manifest to validate, by decision, not by accident. All planning and
design-record artifacts for this work live in `.claude/artifacts/` (no dot): `plan.md`,
`state.md`, `dependency-graph.json`, `invariants.md`, `working-hypotheses.md`, `agent-map.md`,
and — from this phase — `art-direction.md` and `decisions.md` (eight files). The gate set is
`npm run build` · `npm test` · `npm run lint` · `token-diff.mjs --theme src/index.css`. The
token-diff **baseline finding count is 20** (`w-[220px]`, `text-[11px]`, `duration-[220ms]` in
`AppSidebar.tsx` plus others pre-existed the overhaul); no phase was allowed to raise it. It
finished at 15 after Phase 5 deleted `KpiBand` and the old billing body, which carried
pre-existing `text-[11px]` / `text-[19px]` — under budget, not a new rule.

## D-cmo-ui-overhaul-2

**Plus Jakarta Sans replaced IBM Plex as a self-hosted variable woff2; `--font-mono` moved to a
system stack; `--font-display` was added.** All four IBM Plex `@font-face` blocks and the four
`src/assets/fonts/IBMPlex*.woff2` files were removed in the same phase that removed their CSS
references. The font was sourced via `npm pack @fontsource-variable/plus-jakarta-sans@5.3.0`,
extracting `files/plus-jakarta-sans-latin-wght-normal.woff2` (Latin subset, axis 200–800,
`wOF2` magic bytes, 27,348 bytes) to `public/fonts/PlusJakartaSans-VariableFont_wght.woff2`,
with `OFL.txt` committed alongside from the same package's `LICENSE`. The Fontsource package
was used only in a scratch dir and is **not** a runtime dependency (`grep fontsource
package.json` → no match); the font is served from `public/`. No Google Fonts `<link>` was ever
introduced — acquisition failure was defined to block the phase, not fall back to a CDN.

## D-cmo-ui-overhaul-3

**`recharts` v3 was added and is always lazy-loaded; sparklines are hand-rolled inline SVG.**
`npm i recharts@^3` resolved `recharts@3.10.1` with **no `ERESOLVE` and no `--legacy-peer-deps`**
against React 19.2, so the dependency is left at the caret range `^3.10.1` in `package.json`.
The three chart components (`EdVolumeWaitChart`, `DischargeReadinessChart`, `PayerMixDonut`) are
the only files that `import … from 'recharts'`, and each is reached solely through
`lazy(() => import(...))` behind a `Suspense` fallback whose height equals the loaded height.
Build chunk inspection confirms recharts/d3 lands in its own chunks, never the entry bundle.
Sparklines use a pure geometry helper (`src/lib/sparkline.ts` `sparkPoints`) and a single
`<polyline>` — no recharts, and the flat-series divide-by-zero case is explicitly tested.

## D-cmo-ui-overhaul-4

**Container radius went to 12px via `--radius-lg`; `--shadow-card` was added; the
borders-only elevation was relaxed — but `--radius` itself was deliberately left at `0.25rem`.**
`--radius-xl / -2xl / -3xl / -4xl` are `calc(var(--radius) + 4/8/12/16px)`, so raising the base
would silently push every `rounded-xl+` shadcn surface (dialogs, popovers, sheets) to 16–28px.
`--radius-sm/-md/-lg` were set as explicit literals (6 / 8 / 12px) instead, decoupled from the
calc chain. Cards now carry `--shadow-card` (one soft, tinted, themed token, distinct `.dark`
value) in addition to the hairline border. The `src/index.css` comment citing "Decision B2 /
`D-cmo-dashboard-4`" is a stale reference to a decision log that no longer exists — the comment
was left in place and the ID not chased.

## D-cmo-ui-overhaul-5

**A categorical `--chart-1..5` palette was defined with distinct light and dark values; the
accent stays indigo.** The five roles are indigo / teal / amber / rose / green. Previously the
`--chart-*` tokens were stock shadcn greys, which made any multi-series chart unreadable. The
`--color-chart-1..5` aliases in `@theme inline` were already present and unchanged. Dark values
are lightened counterparts (L raised, C trimmed) so all five hues stay distinguishable on the
dark `--card`. The accent (`--primary` / `--ring` / `--sidebar-primary` / auth) remains indigo
`oklch(0.52 0.15 265)` light, `oklch(0.68 0.14 265)` dark — no phase changed it.

## D-cmo-ui-overhaul-6

**Billing & Claims nav was flattened; the sidebar collapse toggle moved into the brand row and
is persisted; collapsed rows gained label tooltips.** `NavItem.children`, `ParentRow`, the
`expandedItems` / `toggleItem` state and the `ChevronDown` / `ChevronRight` / `FileText` /
`Wallet` imports were all removed in one phase (`noUnusedLocals` would fail otherwise). The
collapse control now sits in the `h-14` brand row (wordmark left, toggle right; collapsed = the
centred toggle only, the `Z` mark dropped for space), and the separate `h-10` collapse strip is
gone. Collapsed state persists to `localStorage` (`zelkora.sidebar.collapsed`) via
`try/catch`-wrapped read/write and a lazy `useState` initialiser, so a collapsed rail does not
animate shut on load and private-mode `localStorage` throwing does not white-screen the app.
Disabled rows stay `<a role="link" aria-disabled="true" tabIndex={0}>` (never `<button
disabled>`) so the Radix tooltip is announced. **Tradeoff:** Bills / Payments / HMO Claims are
no longer reachable from the sidebar. Acceptable only because all three are routeless stubs;
recorded here so it is not later rediscovered as a bug.

## D-cmo-ui-overhaul-7

**The CMO home was restructured into a clinical-ops executive view; system telemetry was
demoted; four superseded components were retired.** `CmoDashboardPage` is now a single column of
sections — page header ("Operations Overview") → disabled `DashboardFilterBar` → `KpiCardRow`
(four CMD KPIs with icon chip / value / `DeltaBadge` / `Sparkline`) → 2-up charts row →
`FinancialBillingWidget` (revenue-vs-target headline + four tiles, two independent queries with
scoped failure) → 2-up (`TodaysAppointmentsWidget` + `QualitySafetyWidget`) → a de-emphasised
"System status" band holding `SystemAlertsWidget` / `SystemHealthWidget` /
`RecentActivityWidget`. The page holds **no state and no hoisted query** (I-1); the two
chart-card query owners are module-local components. `KpiBand`, `KpiSummaryBand`,
`RecentBillsList` and `PendingClaimsSummary` were deleted with their last readers, along with
the `Bill` / `BillStatus` types and `revenueBilling.recentBills` / `.pendingBillCount`.
**`StatusChip` was retained** — it has five other consumers (`SystemHealthWidget`,
`SystemAlertsWidget`, `TodaysAppointmentsWidget`, `AccessControlWidget`, its own file).
**Open item:** a critical-alert count in the page header (F5-f / R9) was *not* implemented,
because it needs a hoisted `useSystemAlerts()` that violates I-1; `SystemAlertsWidget` keeps its
own `LiveIndicator` and `sr-only` live count but now sits below the fold. Left for a user
decision: accept as-is, relax I-1 for this one read, or add a self-querying header-alert
component.

---

# Decisions — Global Branch Switcher & Working Date Range

The **next feature** after the overhaul above. Same discipline: each entry records a choice and
why, so the next engineer inherits reasoning rather than a changelog. The seven
`D-cmo-ui-overhaul-*` entries above are the historical record and are untouched.

## D-cmo-branch-filter-1

**One zustand store at `src/features/dashboard/filters/dashboardFiltersStore.ts` holds
`{ branchId, selection }` plus two session-only, non-persisted init flags — and one boolean could
not have served both (D1 + D7).** Store location follows the house precedent exactly:
`features/auth/authStore.ts` is a feature-owned store that chrome (`AppHeader`, `AppSidebar`)
already imports, so "chrome imports a feature store" is established, not novel. The accepted cost
(R4) is that a future non-dashboard consumer of `branchId` would import from `features/dashboard/…`;
the migration path is a move to `src/features/filters/` plus a re-export — a rename, not a redesign.
The two flags are **`persistedOnInit`** (assigned once at module-eval from `decodeFilters().present`,
**never mutated**, so still `true` on the hundredth render after auth resolves) and
**`userSeedApplied`** (starts `false`, flipped exactly once by `markUserSeedApplied()`, called
**unconditionally** inside the `user !== null` branch of `useBranchHydration`). They answer two
different questions — *"was anything stored at init?"* and *"has the one-shot post-auth seed run
this session?"* — whose **correct initialisers are contradictory** (`true` vs `false` for a
returning user at session start). A single `hydratedFromUser` boolean, as the first spec had it,
must therefore either overwrite a returning user's explicit branch choice on every load or never
seed a first-time user. This is the entry that must stop a future "simplification" of the guard.
One localStorage key `zelkora.dashboard.filters`; hand-rolled `try/catch` read/write mirroring the
`AppSidebar` collapse precedent (`D-cmo-ui-overhaul-6`), **not** `zustand/middleware/persist`;
writes live in the setters, never in a `useEffect`; init runs at module-eval time so nothing
flashes. The init write-back fires **only on `decoded.present && decoded.healed`** — a genuinely
bad stored value is corrected in storage immediately, but a **fresh profile persists nothing**
until its first real `setBranchId` / `setSelection` (H-20 / R3b).

## D-cmo-branch-filter-2

**`select` and `popover` came from shadcn and added no dependency; `calendar` was generated
out-of-tree after the in-tree CLI declined a `button.tsx` overwrite.** The already-installed
unified `radix-ui@^1.6.7` exports both `Select` (`dist/index.d.mts:48`) and `Popover` (`:38`), so
the generated `select.tsx` / `popover.tsx` use `import { … as …Primitive } from "radix-ui"` to
match `tooltip.tsx`, and **no `@radix-ui/react-*` package was added** (`grep "@radix-ui/react-"
package.json` → nothing). The exact command run:

```
CI=1 npx --yes shadcn@4.19.0 add select popover calendar --yes --cwd . < /dev/null
```

with `components.json`'s `tailwind.css` target redirected to `src/__shadcn-scratch.css` for the
duration of the run, then `components.json` restored verbatim and the scratch file deleted
(I-40 / R1). `select` and `popover` were generated in-tree cleanly and fully non-interactively.
For `calendar`, the CLI hit a *"button.tsx already exists — overwrite?"* prompt; `< /dev/null`
turned that into an immediate EOF decline (`button.tsx` untouched, fast exit), and the plan's
**out-of-tree fallback** (step 3) produced `calendar.tsx` in a throwaway project against a copied
`components.json`; only `calendar.tsx` was copied into the repo. `src/index.css` is byte-identical
to the P0 hash `ad8fbd93…` and `components.json` has an empty diff. `--overwrite` was deliberately
never passed — its absence is the safety net that made the `button.tsx` collision fail loudly
instead of silently clobbering.

## D-cmo-branch-filter-3

**`react-day-picker@10.0.1` and `date-fns@4.4.0` were added and pinned exact (no caret), both
without `--legacy-peer-deps`.** `date-fns` (Phase 1) resolved with no `ERESOLVE`; `react-day-picker`
(Phase 2) likewise — rdp v10's peer range is `react >=16.8.0`, so React 19.2 is uncontroversial,
and the recharts protocol from `D-cmo-ui-overhaul-3` (pin exact, record the path taken) did not
need its fallback. The calendar is **lazy-loaded from the start** (`DateRangeCalendar.tsx` is a
default export behind `lazy(() => import(...))` + `Suspense`), so `react-day-picker` lands in its
own **53.5 kB chunk** (`DateRangeCalendar-*.js`) and never enters the entry chunk
(`grep DayPicker dist/assets/index-*.js` → nothing) — the Phase 2 entry-chunk measurement (delta
**0 B** while unmounted) drove the F4-g decision to lazy-load proactively. Radix `Select`, by
contrast, is **global app chrome and cannot be lazy-loaded**: it added ~72 kB to the entry chunk
in Phase 3 (544,596 → 616,254 B). Phase 4's `Popover` wiring added a further +8,746 B (shares
Phase 3's Radix deps); Phase 5's store import into the 11 hooks added +726 B. Feature entry-chunk
total: 544,596 → 625,726 B.

## D-cmo-branch-filter-4

**Date semantics are pure and node-testable because `today` is injected as a `YYYY-MM-DD`
string.** `src/features/dashboard/filters/dateRange.ts` contains no React, no `localStorage`, and
**no argument-less `new Date()` / `Date.now()`** — `today` is always a parameter. All arithmetic
goes through `date-fns` calendar helpers (`parseISO`, `subDays`, `startOfQuarter`, `startOfYear`,
`differenceInCalendarDays`, `format(d,'yyyy-MM-dd')`); **`toISOString()` is banned** (it converts
to UTC and shifts the date a day west of Greenwich — F1-a), enforced by a grep gate. The "last N"
presets are **inclusive of today** (`last7` = `today − 6d … today`); "This quarter" and "Year to
date" are **to-date** (`startOfQuarter(today) … today`), so `from === to` on the first day of a
quarter/year — that looks like a bug and is a named test case so nobody "fixes" it (F1-f / H-15).
`MAX_RANGE_DAYS = 366` (fits YTD on Dec 31 of a leap year — the largest a preset can resolve to);
`normalizeSelection` is a self-heal ladder (junk → `today`; non-custom drops `from`/`to`; reversed
→ swap; future → clamp to `today`; oversized → clamp to 366 days) and is **idempotent**
(`n(n(x)) === n(x)`, tested). `decodeFilters` returns **`present` and `healed` as two separate
questions** — `healed` is always `false` when `present` is `false`, so the store's
`present && healed` write-back guard can never be tripped by an absent key (F1-e / DE Issue C).

## D-cmo-branch-filter-5

**`rangeKey = `${from}_${to}`` — the resolved window, not the preset name (D5).** A bare preset
name (`'last7'`) as the cache key would be a **midnight-rollover correctness bug**: the window a
preset resolves to changes at midnight, so React Query would keep serving yesterday's data under
today's key indefinitely. Keying on the resolved `from_to` string means the key *is* what a real
backend would be queried with (`?from=…&to=…`), two selections that resolve to the same window
correctly share one cache entry, and rollover is free. `rangeKey` is always a plain string, never
a `Date` or object (I-33).

## D-cmo-branch-filter-6

**The 11 `use<Name>()` hooks read the store internally via one shared `useDashboardQueryScope()`;
signatures are unchanged and no call site moved (D4).** Each hook now calls
`const scope = useDashboardQueryScope()` and keys its query
`['dashboard', <slug>, scope.branchId, scope.rangeKey]`. The rejected alternative — explicit
`useEdFlow({ branchId, rangeKey })` args — was sold as "more testable", but that is **fictional in
this repo**: vitest runs `environment: 'node'` and collects `.test.ts` only (I-21), so a React
Query hook cannot be exercised under either option. The genuinely testable logic (`resolveRange`,
`normalizeSelection`, `decodeFilters`) is pure and already has real tests. The store-read option
costs zero caller churn and makes it *impossible* for a caller to pass a stale key. The scope is
kept as a **single `scope` object**, not destructured: under `noUnusedLocals`, destructured
`from`/`to` would be unused locals (the fixture is still returned unchanged) and fail the build —
the object keeps all four values live and the BACKEND SWAP comment literally accurate (F5-c).
`placeholderData: keepPreviousData` uses the **v5** form (value imported from
`@tanstack/react-query`); the v4 `keepPreviousData: true` option was removed and silently does
nothing (F5-a). All 11 widget loading predicates were audited and already branch on `isPending`,
not `isFetching`, so `keepPreviousData` (which keeps `isPending === false` across a key change)
means **no full-board skeleton flash** on a switch — no predicate needed fixing (F5-f / H-8).

## D-cmo-branch-filter-7

**`DashboardFilterBar` was deleted outright and the dashboard page header restructured into a
title-left / range-right row.** The visual-only three-chip bar (`Date range`, `Facility`,
`Service line` + a "Filtering arrives with live data" tooltip) is gone — the component file, its
import (`CmoDashboardPage.tsx:7`) and its usage (`:116`) were removed in the **same phase** so
`tsc -b` never sees an orphaned import (I-20). **Facility and Service line were dropped entirely**,
not reimplemented — branch selection lives in the global header switcher, and there is no
service-line concept in scope. The `font-display text-2xl` h1 "Operations Overview", its subtitle
and the section order below the header are unchanged; the header container became a
`flex … justify-between` row with the new `DateRangeControl` on the right.

## D-cmo-branch-filter-8

**`placeholderData: keepPreviousData` on all 11 queries, accepting ~300 ms of partial staleness
during a switch (F5-h / R13).** With 11 independent queries (I-1) resolving at slightly different
times behind `keepPreviousData`, there is a brief window where some widgets show the new window's
data and some still show the previous. This is **invisible today** because every fixture is
branch/range-agnostic by resolved requirement (H-16), and acceptable in principle because the
widgets are independent. It **stops being invisible the moment a real backend lands** — the
recorded follow-up is an `isPlaceholderData`-driven opacity or `aria-busy` treatment, a known
option rather than a surprise.

## D-cmo-branch-filter-9

**Version-control baseline (D8 / DE Issue D): the user authorised P0 Option A.** The entire
completed CMO overhaul (Phases 1–6) was **uncommitted** when this feature started —
`src/index.css` modified, `src/features/dashboard/` untracked, `AppHeader` / `AppSidebar` /
`navigation.ts` untracked, `src/features/auth/types.ts` modified, `.claude/artifacts/` untracked,
plus a **staged deletion** of the dotted `.claude/.artifacts/design/` pipeline store. On
2026-08-30 the user (valentinesamuel2580@gmail.com) gave an explicit "Option A" answer to the
Operator's blocking P0 question. One checkpoint commit was made of the finished, gate-green
overhaul — **`BASELINE_SHA = 1dfb27b769030d884adaf00b635685c531795da5`** (branch `DEV`, parent
`bea5f9e`) — which also made the `.claude/.artifacts/design/` deletion **permanent** (I-29:
`git log --oneline -- .claude/.artifacts` shows only that checkpoint). Gate readings were re-run,
not copied, before committing: build exit 0 / 45 tests / lint 0 err + 1 warn / token-diff 15.
Every phase thereafter ended in its own commit, so each phase's `git diff HEAD` gates answered
"what did *this phase* change": Phase 1 `c2803df`, Phase 2 `9e15733`, Phase 3 `d1e64d4`, Phase 4
`dfc35aa`, Phase 5 `d87492b` (each followed by a small `docs(pN)` commit recording the SHA in
`state.md`). The Option-B recorded-hash fallback was **not** taken; a future reader can rely on
the SHAs existing. `.claude/` is confirmed tracked (A13 verified — the checkpoint commit touched
it), so Phase 6's `git diff HEAD -- art-direction.md` gate is real and passed empty.

## D-cmo-branch-filter-10

**The 360px header responsive ladder (Phase 3 step 6c) was never triggered — no chrome behaviour
changed.** Adding the `BranchSwitcher` to `AppHeader`'s right cell did not force the escalation
path (`min-w-0`+`truncate` → shortName-only below `sm` → hide the centre patient-search below
`sm`). The pre-feature 360px baseline capture (H-5 / R6) and the interactive 360px verdict were
**deferred to the E2E pass** — no interactive browser was available across the Operator runs — so
this entry records only that no code-level chrome change was made; the visual 360px check remains
owed at E2E alongside the other deferred manual/DevTools checks (H-12, H-17, H-20, keyboard /
screen-reader / reduced-motion, React Query devtools refetch verification).
