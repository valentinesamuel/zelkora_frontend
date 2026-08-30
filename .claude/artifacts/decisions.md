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
