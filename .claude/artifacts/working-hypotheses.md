# Working Hypotheses — Global Branch Switcher & Working Date Range

Beliefs about this system that were **not proven by execution at planning time**. Each carries a
status, the evidence that settled it (or would), and what changes if it is false.

Status legend: **VERIFIED** (evidence in hand) · **LIKELY** (strong reasoning, no execution) ·
**UNVERIFIED** (must be checked) · **FALSIFIED**.

**Revision:** Phases 1–6 executed (Operator runs "1,2", "3,4", "5,6"). Statuses updated from
execution evidence. Everything still `UNVERIFIED` below is an item **owed at the E2E pass** — no
interactive browser was available across the Operator runs, so every manual / DevTools / a11y
check was deliberately deferred to a single end-to-end session.

---

## Dependency surface

### H-1 — `radix-ui@1.6.7` already provides `Select` and `Popover`, so shadcn adds no dependency for them — **VERIFIED**
`node_modules/radix-ui/dist/index.d.mts:38` (`Popover`), `:48` (`Select`). Phase 2 generated
`select.tsx` / `popover.tsx` in the `from "radix-ui"` house idiom; `package.json` gained no
select/popover package.

### H-2 — The shadcn CLI will nonetheless add `@radix-ui/react-select` / `-popover` to `package.json` — **FALSIFIED**
Phase 2: `git diff HEAD -- package.json` after the run added **only** `react-day-picker`.
`grep "@radix-ui/react-" package.json` → nothing, at every phase boundary since. No import rewrite
was needed — the generated files already used the unified package.

### H-3 — `react-day-picker` installs clean against React 19.2 — **VERIFIED**
Phase 2: `react-day-picker@10.0.1` pinned exact, installed with **no `ERESOLVE` and no
`--legacy-peer-deps`** (rdp v10 peer range is `react >=16.8.0`). The presets-only fallback (D3)
was not needed.

### H-4 — `react-day-picker` bundles `date-fns` transitively, so the explicit install is redundant — **VERIFIED as irrelevant**
`dateRange.ts` imports `date-fns` directly and it is declared explicitly (`date-fns@4.4.0`, exact,
Phase 1). Phase 2 did not re-caret or bump it (`grep '"date-fns"' package.json` → `4.4.0` at every
boundary).

### H-19 — `shadcn@4.19.0 add` can be made fully non-interactive with `CI=1` + `npx --yes` + `--yes` + `--cwd .` — **PARTIALLY VERIFIED; the plan's structure absorbed the gap**
Phase 2: `select` and `popover` were generated **in-tree, fully non-interactively**. `calendar`
hit a *"button.tsx already exists — overwrite?"* prompt; `< /dev/null` converted it to an
immediate EOF decline (`button.tsx` untouched, fast exit) and the plan's **out-of-tree fallback**
(step 3) produced `calendar.tsx`. The hard backstop worked exactly as designed — no prompt was
ever answered interactively, the run stays reproducible, and I-35b holds. `--overwrite` was never
passed; its absence is what made the collision fail loudly.

### H-5 — `AppHeader` already overflows at 360px, before any switcher is added — **UNVERIFIED (owed at E2E)**
No interactive browser in any Operator run, so the pre-feature 360px baseline was **not captured**
(H-5 / R6). Phase 3 added the `BranchSwitcher` to the right cell **without triggering the
responsive ladder** (`D-cmo-branch-filter-10`) — no `truncate` / shortName-only / hide-search
change was made in code. The interactive 360px verdict remains owed: if overflow is found at E2E,
the fix candidates in priority order are `min-w-0`+`truncate`, then shortName-only below `sm`,
then hiding the centre patient-search below `sm` (that last one is a chrome behaviour change and
must be flagged to the user).

---

## Type system & React Query

### H-6 — `['dashboard','edFlow', scope.branchId, scope.rangeKey] as const` with `branchId: string` satisfies React Query's key type — **VERIFIED**
Phase 5: `npm run build` exits 0 with all 11 four-element keys. The store's `branchId` is kept as
`string` (not a `BRANCHES`-id union), so no `setQueryData(string)` call site could break.

### H-7 — Nothing in the repo asserts the current **2-element** dashboard key shape — **VERIFIED**
Phase 5: `grep -rn "'dashboard'" src/` outside the `.api.ts` files → nothing; no
`invalidateQueries` / `setQueryData` / `getQueryData` call against `['dashboard', …]` exists.
`grep -rn "\['dashboard', '[a-zA-Z]*'\] as const" src/` → nothing (no 2-element key survives).

### H-8 — `placeholderData: keepPreviousData` keeps `isPending === false` across a key change, so widgets branching on `isPending` never flash — **VERIFIED (static); devtools confirmation owed at E2E**
Phase 5 audit: all 11 widget loading predicates
(`KpiCardRow`, `SystemHealthWidget`, `SystemAlertsWidget`, `RecentActivityWidget`,
`QualitySafetyWidget`, `AccessControlWidget`, `TodaysAppointmentsWidget`,
`FinancialBillingWidget` ×2, and the two module-local chart-card owners in `CmoDashboardPage`)
branch on `isPending`, not `isFetching`. **No predicate needed fixing.** The runtime proof
("exactly 11 fetches then idle, no full-board skeleton flash on a switch") is owed at E2E with
React Query devtools open.

---

## Theme, motion & the CLI

### H-9 — The global `prefers-reduced-motion` backstop in `src/index.css` covers Radix's `animate-in` / `zoom-in-95` classes on portalled content — **UNVERIFIED (owed at E2E)**
Not checkable without a browser. If it does not reach `tw-animate-css` keyframe utilities on a
portalled `PopoverContent` / `SelectContent` / calendar, add `motion-reduce:animate-none` /
`motion-reduce:transition-none` **on the components** (I-17) — never edit `src/index.css` (I-40).

### H-10 — `npx shadcn add` will write into `src/index.css` — **VERIFIED, and neutralised**
Phase 2 redirected `components.json`'s `css` target to `src/__shadcn-scratch.css` for the run,
then restored `components.json` verbatim and deleted the scratch file. `shasum src/index.css` is
byte-identical to the P0 hash `ad8fbd93…` at every phase boundary including feature end;
`git diff 1dfb27b..HEAD -- src/index.css components.json` is empty. No missing token was hit — the
existing `--popover` / `--accent` / `--muted` / `--border` / `--ring` were sufficient.

### H-11 — The generated `calendar.tsx` ships Tailwind arbitrary values and/or a non-component export — **VERIFIED as no-impact**
token-diff held at **15** (the ceiling) at the Phase 2 boundary and every boundary since; `npm run
lint` is 0 errors / 1 pre-existing warning throughout. Any `var(--…)` forms in the generated
calendar are token-diff-exempt; no literal px/rem form pushed the count.

---

## Behaviour & state

### H-12 — A returning user's persisted branch survives `authStore` bootstrap — **UNVERIFIED (owed at E2E); the two-field model is in place**
Phases 1+3 implemented the D7 model: `persistedOnInit` (set once from `decodeFilters().present`,
never mutated) and `userSeedApplied` (flipped once by `markUserSeedApplied()`, called
unconditionally in the `user !== null` branch of `useBranchHydration`). `grep -rn
"hydratedFromUser" src/` → nothing. **Still the most likely bug in the feature** and still owed
its manual proof: pick branch #3 → reload → still #3; then clear storage → reload → seeded from
`user.branchId`. Both paths must be walked.

### H-20 — A brand-new user's `localStorage` stays untouched until they change something — **UNVERIFIED (owed at E2E); the guard is in place**
Phase 1: `decodeFilters(null, today)` returns `{ present: false, healed: false }` (asserted in
`filtersPersistence.test.ts`), and the store's init write-back is guarded on
`decoded.present && decoded.healed`. Manual proof owed: clear the key → load → touch nothing →
`zelkora.dashboard.filters` absent in DevTools; change the branch once → it appears.

### H-13 — With `dev-branch` at `BRANCHES[0]` (D6), the seeded `dev-cmo` user never sees a post-auth re-key — **LIKELY (owed at E2E)**
`DEFAULT_BRANCH_ID === 'dev-branch' === AuthBootstrap's seeded user.branchId`, so the seed is a
no-op for the demo user. Devtools proof (no key change after auth resolves on a cold load with
empty storage) owed at E2E.

### H-14 — Midnight rollover re-keys the queries once and is harmless — **LIKELY, accepted**
`todayIso()` is read at render; a tab left open past midnight yields a new `rangeKey` on the next
render → one refetch, absorbed by `keepPreviousData`. Correct for a "Today" preset. No
`setInterval` or store write was added to "fix" it (I-36).

### H-15 — `resolveRange` on the first day of a quarter/year returns `from === to`, and that is correct — **VERIFIED**
Phase 1 test matrix: `resolveRange — quarter boundaries (F1-f)` → "first day of Q3 → from === to";
`resolveRange — YTD boundaries` → "Jan 1 → from === to". Named cases, so a future "fix" trips a
red test.

### H-16 — Fixtures being branch-agnostic makes partial staleness during a switch invisible — **VERIFIED by design, time-limited**
Every fixture returns the same payload for every branch (resolved requirement), so the ~300 ms
mixed-data window under `keepPreviousData` is unobservable today. Stops being true with a real
backend — recorded as R13 / `D-cmo-branch-filter-8`, with an `isPlaceholderData` opacity /
`aria-busy` treatment as the known follow-up.

---

## Carried forward from the overhaul — still open

### H-17 (was R20) — recharts v3 emits no React-19 runtime warnings, and `fill="var(--chart-*)"` resolves correctly under `.dark` — **UNVERIFIED (owed at E2E)**
The charts were wired in the overhaul but never exercised in an interactive `npm run dev`. Fold
into this feature's E2E pass — the console is open anyway and the dark-mode toggle is on the
checklist.

### H-18 (was R9 / Q8) — the dashboard header has no critical-alert count, because it would need a hoisted `useSystemAlerts()` and break I-1 — **OPEN, user decision**
Untouched by this feature. Phase 4's header restructure into a `flex justify-between` row leaves a
natural slot for a **self-querying** header-alert component that would satisfy I-1 — but adding it
is out of scope and needs the user's word.
