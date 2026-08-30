# Diff — Zelkora CMO UI Overhaul

Cumulative record of changes applied by the Operator, per phase.

---

## Phase 1 — Design tokens & font foundation  (applied 2026-08-29)

### Modified files
- `src/index.css`
  - Lines 5–32: deleted the four IBM Plex `@font-face` blocks; replaced with **one**
    `@font-face` for `'Plus Jakarta Sans'`, `font-weight: 200 800`, `font-display: swap`,
    `src: url('/fonts/PlusJakartaSans-VariableFont_wght.woff2') format('woff2')`.
  - `@theme inline`:
    - `--font-sans` → `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    - `--font-display` → **new**, same value as `--font-sans`
    - `--font-mono` → `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
    - `--radius-sm: 0.375rem` (was `0.25rem`), `--radius-md: 0.5rem` (was `0.25rem`),
      `--radius-lg: 0.75rem` (was `0.5rem`). `--radius-xl/-2xl/-3xl/-4xl` calc chain **unchanged**.
    - `--shadow-card: var(--shadow-card)` and `--chart-card-h: var(--chart-card-h)` self-aliases
      added after `--color-chart-5` (emits a real `shadow-card` utility — confirmed in built CSS).
    - Load-bearing "Decision B2 / D-cmo-dashboard-4" comment left **verbatim** (stale ID not chased).
  - `:root`:
    - `--chart-1..5` greys replaced with indigo `oklch(0.52 0.15 265)` / teal `oklch(0.70 0.12 190)` /
      amber `oklch(0.80 0.15 80)` / rose `oklch(0.65 0.20 15)` / green `oklch(0.62 0.16 150)`.
    - `--shadow-card: 0 1px 2px oklch(0.2 0.02 265 / 0.06), 0 4px 12px oklch(0.2 0.02 265 / 0.08)` — new.
    - `--chart-card-h: 16.25rem` — new.
  - `.dark`:
    - `--chart-1..5` greys replaced with lightened counterparts `oklch(0.68 0.14 265)` /
      `oklch(0.78 0.11 190)` / `oklch(0.85 0.14 80)` / `oklch(0.72 0.18 15)` / `oklch(0.72 0.15 150)`.
    - `--shadow-card: 0 1px 2px oklch(0 0 0 / 0.4), 0 4px 12px oklch(0 0 0 / 0.3)` — new (black-based).
  - `@layer base` and the `prefers-reduced-motion` backstop: **untouched**.
- `index.html`
  - Added `<link rel="preload" href="/fonts/PlusJakartaSans-VariableFont_wght.woff2" as="font" type="font/woff2" crossorigin />` to `<head>`.
  - `<title>` `zelkora_frontend` → `Zelkora`.

### Added files
- `public/fonts/PlusJakartaSans-VariableFont_wght.woff2` — Latin-subset variable woff2
  (axis 200–800), sourced via `npm pack @fontsource-variable/plus-jakarta-sans@5.3.0` →
  `files/plus-jakarta-sans-latin-wght-normal.woff2`. `wOF2` magic bytes; 27,348 bytes.
- `public/fonts/OFL.txt` — SIL Open Font License 1.1 text, from the same package's `LICENSE`.

### Removed files
- `src/assets/fonts/IBMPlexSans-Regular.woff2`
- `src/assets/fonts/IBMPlexSans-SemiBold.woff2`
- `src/assets/fonts/IBMPlexMono-Regular.woff2`
- `src/assets/fonts/IBMPlexMono-SemiBold.woff2`
- `src/assets/fonts/` (directory — removed, empty after the four deletions)

### Impact summary
- Every surface now renders in Plus Jakarta Sans; mono call sites fall to the system stack.
- New design tokens (`--font-display`, `shadow-card` utility, real `--chart-1..5`,
  `--chart-card-h`, radius sm/md/lg = 6/8/12px) are defined but **not yet consumed** — Phases 2
  and 5 wire them in. `noUnusedLocals` does not flag unused CSS/tokens.
- `--radius` stays `0.25rem`; no `rounded-xl+` shadcn surface is inflated (I-19 / R1 held).
- No new runtime dependency: the Fontsource package was used only via `npm pack` in a scratch
  dir; `grep fontsource package.json` → no match (I-28 / F1-a2 held).
- Build, tests, lint, token-diff all within gate. See checkpoint.md for the numbers.

---

## Phase 2 — Shared primitives + recharts  (applied 2026-08-29)

### Modified files
- `package.json` + `package-lock.json`
  - Added `recharts@^3` → resolved `recharts@3.10.1`. Installed with a plain
    `npm i recharts@^3`; **no `ERESOLVE`, no `--legacy-peer-deps`** against React 19.2.
- `src/features/dashboard/format.ts`
  - New `integerFormatter` (`Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })`).
  - Added `formatNumber(n)` — thousands-separated integer, 0 decimals.
  - Added `formatPercent(n, digits = 1)` — input is an already-scaled percentage
    (`94.8 → "94.8%"`), **not** a 0–1 ratio; doc-commented as the likely silent bug.
  - Added `formatNairaCompact(amountMinor)` — kobo in; `₦2.9M` / `₦884K` / `₦950`;
    thresholds `<100_000` / `<100_000_000` / `<100_000_000_000` on the absolute kobo
    value; sign outside the symbol (`-₦2.9M`).
  - The three existing exports and the "no React, no side effects" rule are untouched.
- `src/features/dashboard/format.test.ts`
  - Import list extended; new `describe` blocks for `formatNumber`, `formatPercent`,
    `formatNairaCompact` including every documented threshold boundary and the
    negative / zero cases. 14 → 26 tests in this file.
- `src/features/dashboard/components/WidgetCard.tsx`
  - `rounded-none` → `rounded-lg`; added `shadow-card`; `p-4` → `p-5`; `border` kept.
  - New optional `subtitle?: string` prop, rendered `text-xs text-muted-foreground`
    under the title inside a `min-w-0` wrapper.
  - Header `h-8` (fixed 32px, clips a subtitle) → `min-h-8`. With no subtitle the
    single-line header still resolves to 32px, so every existing widget is unchanged.

### Added files
- `src/lib/sparkline.ts` — `sparkPoints(values, w, h): string`. Pure SVG geometry.
  `[]` → `''`; single value → centre point; all-equal → flat line at mid-height
  (guards the `max - min === 0` divide-by-zero that would emit `NaN,NaN`).
- `src/lib/sparkline.test.ts` — the required matrix: empty, single, all-equal
  (asserts no `NaN`), negatives, ascending. 5 tests.
- `src/features/dashboard/components/` — 11 presentation primitives, none imported
  anywhere yet (Phase 5 wires them; `noUnusedLocals` tolerates unused exports):
  - `IconChip.tsx` — `size-9` `rounded-md` tinted tile, `size-4` icon, `aria-hidden`,
    tone map `accent|success|warning|danger` (module-local `Record`).
  - `DeltaBadge.tsx` — arrow glyph by `sign(value)` (`ArrowUpRight`/`ArrowDownRight`/
    `Minus`), colour by semantic `intent` (decoupled from sign); glyph + label text
    both carry meaning.
  - `Sparkline.tsx` — inline `<svg viewBox="0 0 64 20" preserveAspectRatio="none">` +
    one `<polyline>` from `sparkPoints`, `stroke="currentColor"`, `vectorEffect`
    `non-scaling-stroke`; renders `null` for `< 2` points. No recharts.
  - `KpiCard.tsx` — `IconChip` + label + `font-display text-3xl tabular-nums` value +
    `DeltaBadge` + `Sparkline`; own bordered `rounded-lg shadow-card` surface (not a
    `WidgetCard`, I-2).
  - `KpiCardRow.tsx` — owns `useDashboardKpis()`; `grid gap-4 grid-cols-1
    sm:grid-cols-2 xl:grid-cols-4`; pending → 4 `KpiCardSkeleton`s with the identical
    box model; error → `ErrorBanner` + refetch; empty → `EmptyState`. Maps the
    current `KpiItem` shape; `spark`/`deltaIntent` derived as placeholders until
    Phase 4 (see checkpoint "Context for Next Phase").
  - `ChartCard.tsx` — card chrome + body `h-[var(--chart-card-h)] w-full min-w-0`
    (token-diff skips `var(--…)`).
  - `EdVolumeWaitChart.tsx` — **default export**; recharts `ComposedChart`, `Bar`
    (visits, `var(--chart-2)`, left axis) + `Line` (avg wait, `var(--chart-1)`, right
    axis); `<figure>` + `sr-only` `<figcaption>` trend summary; `animate` prop for
    reduced-motion.
  - `DischargeReadinessChart.tsx` — **default export**; recharts donut, slices
    `var(--chart-5|3|4)`; `Legend` + `sr-only` summary; `animate` prop.
  - `PayerMixDonut.tsx` — **default export**; 2-slice donut `var(--chart-1|2)`,
    centre total via `formatNairaCompact`; `sr-only` figcaption; `animate` prop.
  - `DashboardFilterBar.tsx` — visual-only; inert control chips; whole row is a
    focusable `<div tabIndex={0}>` inside its own `TooltipProvider` (R14 — a
    `disabled` control cannot be a tooltip trigger); `TooltipContent` "Filtering
    arrives with live data."
  - `SectionHeading.tsx` — `font-display` heading + muted subtitle, plain `<div>`.

### Removed files
- none

### Impact summary
- `npm run build` / `npm test` / `npm run lint` / token-diff all within gate
  (see checkpoint.md). Test count 14 → 31.
- The existing dashboard changes **only** through `WidgetCard`: `rounded-lg`,
  `shadow-card`, `p-5`. No widget passes `subtitle`, so nothing else moves.
- The 11 new primitives typecheck under strict TS but are unmounted — module count
  is still 2084, recharts is in **no** built chunk (no consumer until Phase 5).
- `from 'recharts'` appears in exactly the three chart files; each is a default
  export ready for `lazy(() => import(...))` in Phase 5.
- No stray runtime dep beyond `recharts` (`shadcn`/`tw-animate-css` unchanged).

---

## Phase 3 — Sidebar  (applied 2026-08-29)

### Modified files
- `src/app/layouts/navigation.ts`
  - `NavItem` interface: removed `children?: NavItem[]`.
  - Import list: removed the now-unused `FileText` and `Wallet`. `ShieldCheck` kept
    (still used by `Roles / Permissions`); `ReceiptText` kept (Billing & Claims).
  - Finance group: `Billing & Claims` is now a single flat
    `{ label: 'Billing & Claims', icon: ReceiptText, enabled: false }` — the three
    child entries (`Bills` / `Payments` / `HMO Claims`) are gone.
- `src/app/layouts/AppSidebar.tsx`
  - Imports: dropped `ChevronDown`, `ChevronRight` from the lucide import; added
    `type ReactElement` to the `react` import.
  - Deleted `ParentRow` (the Finance disclosure button + chevron), the
    `expandedItems` state, `toggleItem`, and the `expanded` / `onToggle` props that
    were threaded through `NavRow`. `NavRow` now takes only `{ item, collapsed, depth }`
    and has no `hasChildren` branch and no nested `<ul>`.
  - New module-local `CollapsedTooltip({ show, content, children })` — returns
    `children` unwrapped when `show` is false (expanded-enabled DOM is byte-identical
    to before), else wraps in `<Tooltip><TooltipTrigger asChild>…<TooltipContent
    side="right">`.
  - `EnabledRow` now wrapped in `<CollapsedTooltip show={collapsed} content={item.label}>`
    — a collapsed enabled row names itself on hover **and** focus; expanded enabled
    rows get no tooltip. `aria-label={collapsed ? item.label : undefined}` unchanged.
  - `DisabledRow` now wrapped in `<CollapsedTooltip show content={collapsed ?
    `${item.label} · Coming soon` : 'Coming soon'}>` — expanded shows the unchanged
    `Coming soon`; collapsed shows `<label> · Coming soon`. The row element is still
    `<a role="link" aria-disabled="true" tabIndex={0} onClick={preventDefault}>`
    (I-3 / R7 — not converted to `<button disabled>`).
  - New module-local `COLLAPSED_STORAGE_KEY = 'zelkora.sidebar.collapsed'`,
    `readCollapsed()` and `writeCollapsed(v)` — both wrapped in `try/catch`
    (Safari private mode / webviews throw). `useState(() => readCollapsed())` lazy
    initialiser so the width transition never fires on mount. `toggleCollapsed()`
    computes `next`, calls `setCollapsed(next)` then `writeCollapsed(next)` — write
    in the handler, not an effect.
  - Brand row (`h-14 border-b`): now `justify-between px-4` expanded (wordmark left,
    collapse toggle right) / `justify-center px-0` collapsed (toggle only, centred —
    the `Z` mark is dropped, D8 / F3-e). The toggle `<button>` uses the class string
    copied verbatim from the old collapse strip, so the focus ring is unchanged.
  - Deleted the separate `h-10 border-t` collapse strip. Identity + sign-out block
    (which carries its own `border-t`) now sits directly under `<nav>`.
  - `delayDuration` **not** added anywhere — it is already `0` on the `TooltipProvider`
    wrapper default (H-10).

### Added files
- none

### Removed files
- none

### Impact summary
- Finance shows one flat disabled `Billing & Claims` row, no chevron, no disclosure.
- The collapse control sits in the brand row on the same 56px band as `AppHeader`;
  `h-14` alignment preserved. No `h-10` strip above the identity block.
- Collapse state persists across reloads via `localStorage`; lazy initialiser means
  a persisted-collapsed sidebar paints collapsed with no slide animation on load.
- Every collapsed nav icon (enabled and disabled) raises a right-side label tooltip
  on hover and on keyboard focus; `TooltipContent` is portalled to `document.body`
  by the existing `ui/tooltip.tsx` wrapper, so it is not clipped at `w-16` (F3-f).
- `Bills` / `Payments` / `HMO Claims` are no longer reachable from the sidebar
  (F3-g / D4) — accepted: all three are stubs with no route.
- `npm run build` / `npm test` (31) / `npm run lint` (0 err, 1 pre-existing warn) /
  token-diff (20 = baseline) all within gate. Entry JS 536.87 → 535.35 kB (dead
  chevron/disclosure code + two unused lucide icons removed).

---

## Phase 4 — Data layer (additive fixtures & types)  (applied 2026-08-29)

### Modified files
- `src/features/dashboard/types/dashboardKpis.types.ts`
  - `KpiItem` gains **required** `deltaIntent: 'good' | 'bad' | 'neutral'` and
    `spark: number[]` (7–12 point history).
  - `unit?: string` **removed** — grep-verified zero readers (`KpiCard`, `KpiBand`,
    `KpiSummaryBand` never render it); resolves open question Q5. Optional + unread,
    so removal orphans nothing (I-9 not implicated).
  - Header comment notes percentages are stored as `87.4`, not `0.874` (I-12 / F4-c).
- `src/features/dashboard/api/dashboardKpis.fixtures.ts`
  - Four metrics swapped to CMD concerns: **ED average wait** (`42 min`),
    **Inpatient occupancy** (`87.4%`), **Patients awaiting discharge** (`23`),
    **Nursing overtime** (`11.2%`). Each carries `deltaIntent` (semantic, e.g. a
    falling ED wait is `good`) and a 7-point `spark` whose last value equals `value`.
    `display` stays pre-formatted. `unit` lines dropped.
- `src/features/dashboard/types/revenueBilling.types.ts`
  - `RevenueSummary` gains `targetMinor`, `collectionsRatePct` (0–100),
    `outstandingArMinor`, `daysInAr`, `trend: number[]` (major-unit naira, last
    point = `totalMinor / 100`). **`recentBills` and `pendingBillCount` retained** —
    `FinancialBillingWidget` still reads them; removed in Phase 5 (I-9 / F4-a).
  - Header comment: percentages stored as 0–100.
- `src/features/dashboard/api/revenueBilling.fixtures.ts`
  - `summary` gains `targetMinor: 320_000_000` (₦3.2M), `collectionsRatePct: 91.9`
    (≈ `totalMinor / targetMinor`), `outstandingArMinor: 840_000_000`, `daysInAr: 38`,
    `trend: [2_610_000 … 2_940_500]` (ends at `totalMinor / 100`).
    `recentBills` / `pendingBillCount` untouched.
- `src/features/dashboard/types/hmoClaims.types.ts`
  - `HmoClaimsSummary` gains `denialRatePct` (0–100) and `daysToAdjudication`.
- `src/features/dashboard/api/hmoClaims.fixtures.ts`
  - `summary` gains `denialRatePct: 12.5` (3 denied of ~24 adjudicated) and
    `daysToAdjudication: 16`.

### Added files
- `src/features/dashboard/types/edFlow.types.ts` — `EdFlowPoint { day; visits; avgWaitMin }`,
  `EdFlowResponse { points }`.
- `src/features/dashboard/api/edFlow.api.ts` — `useEdFlow()`, `queryKey: ['dashboard','edFlow']`,
  `await delay(300)` → fixture. Copied verbatim from the `dashboardKpis` trio.
- `src/features/dashboard/api/edFlow.fixtures.ts` — 7 daily points; final `avgWaitMin: 42`
  matches the ED-average-wait KPI; visits peak Fri.
- `src/features/dashboard/types/dischargeReadiness.types.ts` —
  `DischargeReadinessResponse { readyNow; readySoon; notReady }`.
- `src/features/dashboard/api/dischargeReadiness.api.ts` — `useDischargeReadiness()`,
  `queryKey: ['dashboard','dischargeReadiness']`, `await delay(300)`.
- `src/features/dashboard/api/dischargeReadiness.fixtures.ts` — `18 / 34 / 205`;
  257 admitted ≈ 87.4% of ~294 beds (ties to the occupancy KPI); `readyNow` ties to
  the 23 awaiting-discharge KPI.
- `src/features/dashboard/types/qualitySafety.types.ts` —
  `QualitySafetyIndicator { id; label; display; deltaIntent }`,
  `QualitySafetyResponse { indicators }`.
- `src/features/dashboard/api/qualitySafety.api.ts` — `useQualitySafety()`,
  `queryKey: ['dashboard','qualitySafety']`, `await delay(300)`.
- `src/features/dashboard/api/qualitySafety.fixtures.ts` — 4 indicators: mortality
  index `0.92`, HAI rate `1.4`, 30-day readmission `11.8%`, patient-safety events `7`.
- `src/features/dashboard/api/fixtures.test.ts` — 14 shape/consistency assertions
  across all six resources: `spark.length >= 7`, `deltaIntent` ∈ the three literals,
  minor units are integers, `cashMinor + hmoMinor === totalMinor`, `collectionsRatePct`
  ≈ `total / target`, `trend` ends at `totalMinor / 100`, percentages within 0–100,
  edFlow ≥ 7 points, unique ids.

### Removed files
- none

### Impact summary
- **Strictly additive** except `KpiItem.unit` (optional, zero readers). `npm run build`
  exits 0 — proof the current board still compiles: `KpiBand` / `KpiSummaryBand` /
  `KpiCardRow` read only `{id,label,value,display,delta,deltaLabel}`; `FinancialBillingWidget`
  still reads `recentBills` / `pendingBillCount`.
- No visible change beyond the four new KPI labels/values flowing through the existing
  `KpiBand`. The three new resources have no consumer until Phase 5 — their queries do
  not fire yet.
- `npm test` 31 → **45** (new `fixtures.test.ts`). `npm run lint` 0 err / 1 pre-existing
  warn. token-diff **20 = baseline**. 11 distinct `['dashboard', <name>]` query keys,
  no duplicates (F4-e).
- Entry JS 535.35 → 535.75 kB (+0.4 kB — larger `dashboardKpis` / `revenueBilling` /
  `hmoClaims` fixture payloads, all already imported by live widgets).
- **`KpiCardRow` still ships the Phase 2 placeholder** (`spark={[]}`, sign-derived
  `deltaIntent`, generic `SLOT_ICON`). It compiles against the new required fields
  because it simply does not read them yet. Phase 5 must update its `.map()` (R19).

---

## Phase 5 — Dashboard restructure  (applied 2026-08-30)

### Modified files
- `src/features/dashboard/types/revenueBilling.types.ts`
  - **Subtractive (deferred from Phase 4):** removed `Bill`, `BillStatus`,
    `RevenueBillingResponse.recentBills`, `RevenueBillingResponse.pendingBillCount`.
    `Bill`'s sole consumer was `RecentBillsList` (deleted this phase) — re-grepped
    at delete time, no other reader (I-20 / H-11). `RevenueBillingResponse` is now
    `{ summary: RevenueSummary }`.
- `src/features/dashboard/api/revenueBilling.fixtures.ts`
  - Dropped the six-item `recentBills` array and `pendingBillCount: 12`. `summary`
    unchanged (still the Phase 4 additive shape).
- `src/features/dashboard/components/KpiCardRow.tsx`
  - `.map()` now reads `item.spark` and `item.deltaIntent` straight off the item
    (R19 closed). Placeholder `spark={[]}` and the `item.delta` sign derivation are
    gone.
  - `SLOT_ICON` / `SLOT_TONE` positional arrays replaced by `KPI_DECOR`, a
    `Record<string, { icon; tone }>` keyed by the KPI's stable `id`
    (`kpi-ed-average-wait` → `Timer`/accent, `kpi-inpatient-occupancy` →
    `BedDouble`/warning, `kpi-awaiting-discharge` → `DoorOpen`/accent,
    `kpi-nursing-overtime` → `Users`/warning), with an `Activity`/accent fallback.
  - lucide import set changed to `Activity, BedDouble, DoorOpen, Timer, Users`.
- `src/features/dashboard/components/FinancialBillingWidget.tsx` — **body rewrite**
  - Removed `RecentBillsList`, `PendingClaimsSummary`, `SkeletonRow`, `formatNaira`
    imports and the local `SkeletonRows` helper; removed the duplicated
    `"Pending bills · N — Pending HMO claims · N"` line.
  - The useful part now rides `WidgetCard`'s `subtitle` prop:
    `"{pendingCount} HMO claims pending adjudication"` (only when `claims.data`).
  - Row 1 "Today's revenue": `formatNairaCompact(totalMinor)` large, `of target
    {formatNairaCompact(targetMinor)}`, a clamped progress bar
    (`role="progressbar"`, `aria-valuenow` = true rounded %, width clamped 0–100%,
    true % shown as text), and a lazy `<PayerMixDonut>` in a `size-36` box beside
    it wrapped in `<Suspense>` with a same-size pulsing fallback.
  - Row 2: four `MetricTile`s (plain divs, not cards — I-2): Collections rate
    (`formatPercent`), Outstanding AR (`formatNairaCompact`), Days in AR
    (`formatNumber`), Claims denial rate (`formatPercent`).
  - **Two-query resilience preserved (I-1):** `revenue.isError` → `ErrorBanner` in
    the headline region only; the three revenue tiles fall back to `—`.
    `claims.isError` → only the denial-rate tile degrades to `—` + a small Retry.
    Neither blanks the card.
  - **Skeleton parity (I-1b):** the pending headline mirrors the loaded box model
    (label / value / caption / bar + `size-36` donut placeholder); tiles keep the
    same grid and heights with pulsing value blocks.
  - New `animate={!useReducedMotion()}` on the donut.
- `src/features/dashboard/components/TodaysAppointmentsWidget.tsx`
  - Restyle only: `WidgetCard title` `"Today's appointments"` → `"Today's schedule"`
    and the doc comment. Row markup / the `/queue` link left untouched (F5-g).
- `src/features/dashboard/format.ts`
  - `formatDelta` doc comment extended: notes it is currently unused after
    `KpiBand`'s retirement, kept because it is pure and tested (plan step 6 / Q9).
    No behaviour change; the dependency-graph sanctions this one comment edit.
- `src/features/dashboard/pages/CmoDashboardPage.tsx` — **full rewrite**
  - New single-column section stack: page header (`font-display` `<h1>`
    "Operations Overview" + muted subtitle) → `<DashboardFilterBar>` →
    `<KpiCardRow>` → 2-up charts row → `<FinancialBillingWidget>` → 2-up
    (`<TodaysAppointmentsWidget>` + `<QualitySafetyWidget>`) → `<SectionHeading
    title="System status">` over a demoted 3-col band (`SystemAlertsWidget` /
    `SystemHealthWidget` / `RecentActivityWidget`). `AccessControlWidget` stays
    commented out.
  - No page-level state, no hoisted query (I-1). Two module-local wrappers,
    `EdVolumeWaitCard` and `DischargeReadinessCard`, each own one query
    (`useEdFlow` / `useDischargeReadiness`) with their own pending / error / empty
    states and render `<ChartCard>` chrome; the lazy recharts chart mounts only on
    success, inside `ChartCard`'s fixed-height body, behind `<Suspense>` with a
    `size-full` pulsing fallback (F5-b / F5-c).
  - `<h1>Dashboard</h1>` is gone.

### Added files
- `src/features/dashboard/useReducedMotion.ts` — live
  `prefers-reduced-motion: reduce` hook (`.ts`, no JSX). Recharts drives its
  entrance animation in JS, past the CSS backstop; consumers pass
  `animate={!useReducedMotion()}`. Mirrors the existing `AuthCarousel` pattern.
- `src/features/dashboard/components/QualitySafetyWidget.tsx` — consumes
  `useQualitySafety()`; one `WidgetCard` + a `sm:grid-cols-2` grid of plain tiles
  (I-2). Each tile: label, `font-display` display value, and an intent line
  carrying a glyph + word + colour (`▲ Improving` / `▼ Worsening` / `– Stable`) so
  colour is never the only channel (I-14). Own pending (4 skeleton tiles) / error
  / empty states.

### Removed files
- `src/features/dashboard/components/KpiBand.tsx`
- `src/features/dashboard/components/KpiSummaryBand.tsx`
- `src/features/dashboard/components/RecentBillsList.tsx`
- `src/features/dashboard/components/PendingClaimsSummary.tsx`
- **`StatusChip.tsx` NOT deleted** — five consumers survive (`SystemHealthWidget`,
  `SystemAlertsWidget`, `TodaysAppointmentsWidget`, `AccessControlWidget`, its own
  file) (I-24 / H-11 / F5-j).

### Impact summary
- `npm run build` exits 0 (`tsc -b` strict + `noUnusedLocals`); `npm test` **45**
  (unchanged — `fixtures.test.ts` never referenced `recentBills`); `npm run lint`
  0 err / 1 pre-existing warn (`EnrollMfaStep.tsx:78`); token-diff **15**, down
  from the 20 baseline (deleted `KpiBand` / old billing body carried
  `text-[11px]` / `text-[19px]`) — well under budget.
- **Bundle:** recharts stays out of the entry chunk — split into
  `CategoricalChart` (271 kB), `PieChart` (17 kB), `Tooltip` (34 kB) plus the
  three per-chart lazy chunks (`EdVolumeWaitChart`, `DischargeReadinessChart`,
  `PayerMixDonut`). Entry JS 535.75 → **544.59 kB** (+8.8 kB): the Phase 2
  primitives (`KpiCard`, `IconChip`, `DeltaBadge`, `Sparkline`, `ChartCard`,
  `DashboardFilterBar`, `SectionHeading`) were tree-shaken out while unmounted and
  now ship because the page wires them.
- **R19 closed:** `KpiCardRow` reads real `spark` / `deltaIntent` and per-KPI
  icons. **Split writer resolved:** `revenueBilling` subtractive half done in the
  same commit that removed the last reader (I-9).
- **F5-f / R9 NOT implemented:** no critical-alert count in the page header — it
  would require a hoisted `useSystemAlerts()` in `CmoDashboardPage`, violating
  I-1. `SystemAlertsWidget` keeps its own `LiveIndicator` + `sr-only` live count
  but now sits in the bottom band. Flagged for the user.
- Interactive verification (plan criteria 4–11: per-region resilience by throwing
  in each `.api.ts`, CLS under throttling, chart resize 1440→360, dark-mode hue
  legibility, keyboard traversal, reduced-motion) deferred to the consolidated
  E2E pass — same posture as Phases 1–4.

## Phase 6 — Record art direction + decisions  (applied 2026-08-30)

Documentation only. No source file, config, dependency or asset touched.

### Added files
- `.claude/artifacts/art-direction.md` — the shipped visual point of view for the
  CMO dashboard: position, typefaces (Plus Jakarta Sans self-hosted variable
  woff2, system mono, no CDN), shape (`--radius-lg/-md/-sm` = 12/8/6px with
  `--radius` deliberately left at `0.25rem` to protect the `--radius-xl+` calc
  chain), elevation (`--shadow-card` light + dark values, verbatim from
  `src/index.css`), palette (indigo accent + `--chart-1..5` indigo/teal/amber/
  rose/green, light and dark), and the `--chart-card-h: 16.25rem` layout metric.
  All token values transcribed from `src/index.css`, not from `plan.md`.
- `.claude/artifacts/decisions.md` — `## D-cmo-ui-overhaul-1..7`, one paragraph
  each: (1) art direction adopted directly, 6-stage pipeline deliberately unused,
  `validate-manifest.mjs` out of the gate set, token-diff baseline = **20**;
  (2) Plus Jakarta Sans self-hosted via `npm pack @fontsource-variable/…@5.3.0`,
  IBM Plex removed, `--font-mono` → system, `--font-display` added, Fontsource
  not a runtime dep; (3) `recharts@^3.10.1`, no `--legacy-peer-deps` needed,
  always lazy, hand-rolled sparklines; (4) radius 12px via `--radius-lg`,
  `--shadow-card` added, `--radius` unchanged, stale `D-cmo-dashboard-4` comment
  left in place; (5) `--chart-1..5` categorical palette light+dark, accent stays
  indigo; (6) Billing & Claims nav flattened, collapse toggle in the brand row +
  `localStorage`, collapsed-row tooltips, Bills/Payments/HMO Claims now
  sidebar-unreachable (tradeoff recorded); (7) CMO home restructured to the
  clinical-ops view, system telemetry demoted, `KpiBand`/`KpiSummaryBand`/
  `RecentBillsList`/`PendingClaimsSummary` retired, `StatusChip` retained (5
  consumers), F5-f header alert count left as an open user decision.

### Not done (by decision — Phase 6 rehydration context / F6-a..e)
- Nothing written under the **dotted** `.claude/.artifacts/` (the deleted
  design-pipeline store). No `manifest.md` / `design-system.md` /
  `product-architecture.md` / `project-context.md` created. Nothing copied out of
  `.claude/templates/design/`. `validate-manifest.mjs` not run.

### Impact summary
- `npm run build` exits 0 (nothing under `.claude/` is compiled); `npm test` **45
  passed**; `npm run lint` 0 err / 1 pre-existing warn; token-diff **15** (≤ 20
  baseline). All unchanged from Phase 5 — this phase is inert to the build.
- `.claude/artifacts/` now holds the eight design artifacts
  (`plan.md`, `state.md`, `dependency-graph.json`, `invariants.md`,
  `working-hypotheses.md`, `agent-map.md`, `art-direction.md`, `decisions.md`)
  plus the Operator process files `checkpoint.md` and `diff.md`.
