# Zelkora — Global Branch Switcher & Working Date Range — Execution Plan

Supersedes the CMO UI Overhaul plan (Phases 1–6, **complete**, recorded in `decisions.md`
`D-cmo-ui-overhaul-1..7`, `diff.md`, `checkpoint.md`, `art-direction.md` — those files stay).
This document is the execution artifact for the **next** feature only.

**Repo root for every relative path:**
`/Users/valentinesamuel/Desktop/deyon/zelkora/zelkora_frontend`

**Revision:** DE review rounds 1–2 applied —
Issue A (split the overloaded hydration flag into `persistedOnInit` + `userSeedApplied`),
Issue B (non-interactive shadcn CLI contract),
Issue C (no write-on-init for a fresh profile),
**Issue D (establish a real git baseline; every `git diff` gate is scoped to `HEAD`)**.

---

## Global rehydration context (assume nothing else; true for every phase)

### Stack — verified, do not re-derive

- React 19.2 · Vite 8 · TypeScript ~6.0 strict with **`noUnusedLocals: true` in both tsconfigs**
  · Tailwind v4 CSS-first (`@theme inline` inside `src/index.css`; **there is no
  `tailwind.config.*`**) · shadcn style `radix-nova`, CLI `shadcn@^4.19.0` in `devDependencies`
  · `lucide-react@^1.34` · **`radix-ui@^1.6.7` (the unified package)** ·
  `@tanstack/react-query@^5.102` · `zustand@^5.0` · `react-router-dom@^7.18` · `recharts@^3.10.1`
  · `@` → `./src` in `vite.config.ts` **and** `vitest.config.ts`.
- `npm run build` = `tsc -b && vite build`. Any import orphaned by a deletion fails the build.
  `noUnusedLocals` does **not** flag unused *exports*, so a new exported component that nothing
  imports yet still compiles — this is what makes "build the module in phase N, wire it in phase
  N+1" legal here.
- `npm test` = `vitest run`. `environment: 'node'`, `include: ['src/**/*.test.ts']`.
  **No jsdom. `.test.tsx` is not collected. Never write a component-render test.** Only pure
  `.ts` modules are testable — that property is load-bearing for this feature's date logic.
- `npm run lint` = `eslint .`. `eslint-plugin-react-refresh` is active: a `.tsx` must export
  components only. `src/components/**` may never import `src/features/**`
  (`no-restricted-imports`, INV-L2, `eslint.config.js:22-34`).
- **Baseline gate values (do not regress):** `npm run build` exit 0 · `npm test` 45 passing ·
  `npm run lint` **0 errors / 1 pre-existing warning** in `src/features/auth/.../EnrollMfaStep.tsx:78`
  · `node .claude/scripts/token-diff.mjs --theme src/index.css` finding count **15**
  (budget ceiling is the historical baseline **20**; no phase may raise the count above 15).
  Run token-diff **from the FE dir with the RELATIVE `--theme` arg** — an absolute path breaks the
  script's `file.endsWith(THEME)` exemption and falsely reports ~103 findings (R11, learned in the
  overhaul).
- **Do NOT run `node .claude/scripts/validate-manifest.mjs`.** The 6-stage design pipeline is
  deliberately unused; its dotted store `.claude/.artifacts/` was deleted by user decision and
  stays deleted. No phase creates, reads, restores or writes anything there (I-29/I-30).
  Every artifact this feature produces goes in **`.claude/artifacts/` (NO leading dot)**.
- **Version control (I-41, new in DE round 2).** The working tree does **not** start clean — see
  *Baseline capture — Precondition P0*. Once P0 completes, **every phase ends in a commit**, and
  **every `git diff` gate in this plan is scoped to `HEAD`** (`git diff HEAD -- <path>`), so it
  answers "what did *this phase* change" rather than "what has changed since the dawn of the
  repo". Gates run **before** the phase commit, never after.

### Codebase facts this feature touches

- **Data layer — 11 fixture resources** in `src/features/dashboard/api/`: `accessControl`,
  `dashboardKpis`, `dischargeReadiness`, `edFlow`, `hmoClaims`, `qualitySafety`, `recentActivity`,
  `revenueBilling`, `systemAlerts`, `systemHealth`, `todaysAppointments`. Each is
  `types/<name>.types.ts` + `api/<name>.api.ts` + `api/<name>.fixtures.ts`. **Every `.api.ts` is
  18 lines and structurally identical**, e.g. `edFlow.api.ts`:

  ```ts
  import { useQuery } from '@tanstack/react-query';

  import type { EdFlowResponse } from '@/features/dashboard/types/edFlow.types';
  import { delay } from '@/features/dashboard/api/delay';
  import { edFlowFixture } from '@/features/dashboard/api/edFlow.fixtures';

  // BACKEND SWAP: replace the queryFn body with
  //   return apiRequest<EdFlowResponse>('/dashboard/ed-flow');
  // Nothing else in this file changes. Put any snake_case->camelCase transform here.
  export function useEdFlow() {
    return useQuery({
      queryKey: ['dashboard', 'edFlow'] as const,
      queryFn: async (): Promise<EdFlowResponse> => {
        await delay(300);
        return edFlowFixture;
      },
    });
  }
  ```

  All 11 hooks currently take **zero arguments**. Shared `api/delay.ts`.
  `api/fixtures.test.ts` (121 lines) imports **fixtures only, never hooks** — it is unaffected by
  any hook-signature change.
- **`src/features/auth/types.ts`** — `User` already has `branchId: string | null`.
  `AuthBootstrap.tsx` seeds `dev-cmo` with `branchId: 'dev-branch'`.
- **`src/features/auth/authStore.ts`** — plain `zustand` `create()`, **no `persist` middleware**.
  `status` starts `'loading'` and resolves asynchronously via `bootstrap()`; `user` is `null`
  until then. Every other localStorage use in the repo is hand-rolled
  `try { localStorage.getItem/setItem } catch {}` (the Phase 3 `readCollapsed`/`writeCollapsed`
  pattern in `AppSidebar.tsx`).
- **`src/app/layouts/AppHeader.tsx`** (58 lines) —
  `<header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b bg-card px-4">`;
  greeting `<p>` left, a fixed **`h-8 w-60`** patient-search `<button>` centre, and the right cell
  `<div className="flex items-center justify-self-end">` containing **only** the notifications
  `<button>` (Bell, `size-8 rounded-sm`).
- **`src/app/layouts/AppSidebar.tsx:280`** — inside the `{!collapsed && ...}` footer branch:
  ```tsx
  {user?.role ?? '—'}
  {user?.branchId != null && ` · ${user.branchId}`}
  ```
  (raw id). `user?.role` on line 279 keeps `user` in use after the change.
- **`src/features/dashboard/pages/CmoDashboardPage.tsx`** — line 7 imports `DashboardFilterBar`,
  line 116 renders `<DashboardFilterBar />`. The header block is lines 107–114:
  `<header className="min-w-0">` → `font-display text-2xl font-semibold tracking-tight` h1
  "Operations Overview" → `text-sm text-muted-foreground` subtitle. Section order after it:
  `KpiCardRow` → 2-up charts → `FinancialBillingWidget` → 2-up (TodaysAppointments +
  QualitySafety) → `SectionHeading "System status"` → 3-col demoted band. **The page holds no
  state and no hoisted query (I-1)** — the two chart cards are module-local query owners.
- **`src/features/dashboard/components/DashboardFilterBar.tsx`** (52 lines) — visual-only,
  `FILTERS = ['Date range','Facility','Service line']`, one focusable `<div tabIndex={0}>` +
  Radix tooltip "Filtering arrives with live data." **Sole consumer is `CmoDashboardPage`.**
- **`src/components/ui/`** contains: `alert`, `button`, `card`, `checkbox`, `form`, `input-otp`,
  `input`, `label`, `skeleton`, `spinner`, `tooltip`. **No `select`, no `popover`, no `calendar`.**
  No date library in `package.json`.
- **`src/components/ui/tooltip.tsx:2` is the house shadcn idiom:**
  `import { Tooltip as TooltipPrimitive } from "radix-ui"` — the **unified** package, not
  `@radix-ui/react-tooltip`. `TooltipContent` is already wrapped in `TooltipPrimitive.Portal`.
- **`components.json`** — `"style": "radix-nova"`, `"tailwind": { "config": "", "css":
  "src/index.css" }`, `"registries": {}`, `"aliases.ui": "@/components/ui"`.
  **The CLI's `css` target is `src/index.css`** — see F2-c, this is a live I-18/I-40 hazard, and
  Phase 2 step 2 neutralises it structurally.
- **Layout rule** (documented in `AppLayout.tsx`): chrome files "do not fetch domain data, hold
  domain state, or implement feature behaviour — that stays in `src/features/`". `app/` MAY import
  `features/`.
- Accent indigo `oklch(0.52 0.15 265)` — unchanged by this feature. The global
  `prefers-reduced-motion` backstop at the bottom of `src/index.css` — do not touch.
  Only `/dashboard` is a real route; index and `*` redirect to it.

### VERIFIED FINDING that changes the dependency calculus

`node_modules/radix-ui/dist/index.d.mts` line 38 exports `Popover`, line 48 exports `Select`.
**The already-installed `radix-ui@^1.6.7` unified package provides both primitives.** A shadcn
`select`/`popover` generated in the house idiom (`from "radix-ui"`, like `tooltip.tsx`) therefore
adds **zero new dependencies and carries zero React-19 peer-dep risk**. The only genuinely new
runtime dependencies in this feature are **`react-day-picker`** (for the calendar) and
**`date-fns`** (for the resolver). Plan and review accordingly — do not spend risk budget on
`@radix-ui/react-select`.

---

## Resolved requirements (do NOT re-open)

- Branch data is **cosmetic**. Every fixture returns the same payload for every branch. No
  per-branch fixtures, no "All branches", exactly one branch always selected.
- Date range is **plumbed but cosmetic**. It changes query keys and triggers refetches; the
  `queryFn` still returns the unchanged fixture.
- `DashboardFilterBar` is **deleted entirely** — no Facility, no Service line, no Reset.
- One store holds **both** `branchId` and the date selection. **One** localStorage key.
  Hand-rolled `try/catch`, not `zustand/middleware/persist`.
- The switcher **never** mutates the `User` object in `authStore`.
- Presets: Today (**default**), Last 7 days, Last 30 days, Last 90 days, This quarter, Year to
  date, Custom…

---

## Major decisions

### D1 — Where the store lives

| Option | Description |
|---|---|
| **A (recommended)** | `src/features/dashboard/filters/dashboardFiltersStore.ts`. BRANCHES stays a leaf in `src/features/branch/branches.ts`. |
| B | Everything in `src/features/branch/` — store, BRANCHES, switcher, date control. |
| C | A new neutral top-level `src/stores/dashboardFilters.ts`. |

- **A pros:** matches the house precedent exactly — `features/auth/authStore.ts` is a
  feature-owned store that chrome (`AppHeader`, `AppSidebar`) already imports, so "chrome imports
  a feature store" is established, not novel. The date range is genuinely dashboard-scoped, and
  the name does not lie about today's scope. Import graph is acyclic at module level:
  `dashboardFiltersStore → branches` (leaf); `BranchSwitcher → dashboardFiltersStore → branches`.
  `branches.ts` imports nothing.
  **Cons:** a future non-dashboard page wanting `branchId` would import from
  `features/dashboard/…`. Documented as R4 with the migration path (move to `src/features/filters/`
  and re-export) — a rename, not a redesign.
- **B pros:** one dir. **Cons:** the module would be named `branch` while owning a date range —
  the name lies immediately, which is worse than the deferred problem in A.
- **C pros:** architecturally neutral, ages best. **Cons:** invents a top-level directory with no
  precedent in this repo, and `src/components/**` is only ESLint-blocked from `features/**`, so a
  `src/stores/` is reachable from the domain-agnostic layer — it weakens INV-L2's guarantee.

**Recommended: A.** Precedent beats theory here, and the failure mode (a rename) is cheap.

### D2 — Select and popover primitives

| Option | Description |
|---|---|
| **A (recommended)** | shadcn `add select popover` — generate in the house `from "radix-ui"` idiom. |
| B | Hand-roll a dropdown and a popover. |

- **A pros:** Verified zero new dependency (`radix-ui` already exports both). Free typeahead,
  roving focus, `aria-activedescendant`, portal + collision detection, scroll locking, and the
  `radix-nova` styling matches `tooltip.tsx`. **Cons:** the CLI is a code generator that touches
  `components.json`'s `css` target (`src/index.css`), may emit `@radix-ui/react-*` imports
  instead of the unified package, and **prompts interactively** — all three are handled by the
  Phase 2 contract below.
- **B pros:** total control. **Cons:** re-implementing accessible listbox semantics is the single
  most commonly botched widget in frontend work; it would put an a11y regression directly in the
  global app chrome. Not worth it for a 4-item list.

**Recommended: A**, with the non-interactive contract and post-install audit in Phase 2.

### D3 — Calendar

| Option | Description |
|---|---|
| **A (recommended)** | shadcn `add calendar` → `react-day-picker` + `date-fns`, both pinned exactly. |
| B | Hand-roll a two-month range grid. |
| C | Presets only; drop "Custom…". |

- **A pros:** `react-day-picker` v9 is the de-facto accessible range calendar (grid semantics,
  arrow-key navigation, `aria-selected`, month/year announcements) and is what shadcn's `calendar`
  wraps, so the generated component is already tokenised for this theme. **Cons:** two real new
  runtime deps (~30 kB gz for rdp + tree-shaken date-fns) and a genuine React-19 peer-dep question.
- **B cons:** a keyboard-navigable date grid with range selection, month boundaries and
  screen-reader announcements is a week of work and an a11y liability.
- **C** is out — "Custom…" is a resolved requirement.

**Recommended: A.** Bundle cost is bounded and can be lazy-loaded (F4-g); the a11y cost of B is not.

### D4 — Hook contract for the 11 `use<Name>()` hooks

| Option | Description |
|---|---|
| **A (recommended)** | Hooks read the store internally via one shared `useDashboardQueryScope()`. Signatures unchanged. |
| B | Explicit args: `useEdFlow({ branchId, rangeKey })`. |

- **A pros:** **zero caller churn** — none of the ~12 widget call sites change, so Phase 5 is 11
  identical mechanical edits and the `tsc -b` boundary is trivially green. `fixtures.test.ts`
  imports fixtures, not hooks, so it is untouched either way. It is *impossible* for a caller to
  pass a stale or wrong key, which is the actual bug class this feature can produce.
  **Cons:** the hooks become store-coupled and untestable in isolation.
- **B pros:** "more testable" — **but this advantage is fictional in this repo.** Vitest runs
  `environment: 'node'` and collects `.test.ts` only (I-21); a React Query hook cannot be
  exercised here under either option. B's real cost is 12 changed call sites, a wrapper for any
  caller that lacks the values, and a new way to introduce a wrong key.

**Recommended: A.** The genuinely testable logic (`resolveRange`, `normalizeSelection`,
`decodeFilters`) is pure and lives in `.ts` modules with real tests. B buys testability that the
test environment cannot cash.

### D5 — `rangeKey` shape

| Option | Description |
|---|---|
| A | `rangeKey = preset` (e.g. `'last7'`). |
| **B (recommended)** | `rangeKey = \`${from}_${to}\`` — the resolved window, e.g. `'2026-08-24_2026-08-30'`. |
| C | `` `${preset}:${from}_${to}` ``. |

- **A is a correctness bug:** the window a preset resolves to changes at midnight, so the cache
  would serve yesterday's data under today's key forever.
- **B pros:** the key *is* the window, which is exactly what a real backend would be queried with
  (`?from=…&to=…`). Two selections resolving to the same window correctly share a cache entry.
  Rolls over at midnight for free. **Cons:** none material.
- **C** creates duplicate cache entries for identical windows for no benefit.

**Recommended: B.**

### D6 — `BRANCHES[0]` identity

Put the `dev-branch` entry **first**. `authStore.status` starts `'loading'` and `user` is `null`,
so the store must initialise `branchId` before the seeded user is known (R2). Making the seeded
branch the array head means the common path never re-keys after auth resolves, eliminating a
visible-but-harmless refetch on every cold load. This is a plan-level choice, not a requirement.

### D7 — Two separate init flags, not one (DE Issue A)

The store needs to answer **two independent questions**, and one boolean cannot:

| Question | Field | Lifetime |
|---|---|---|
| "Was there a stored value at module-eval time?" | **`persistedOnInit: boolean`** | Set **once** at init from whether `readRaw()` returned non-null. **Never mutated.** |
| "Has the one-shot post-auth user seed already run this session?" | **`userSeedApplied: boolean`** | Starts `false`; flipped to `true` exactly once by `markUserSeedApplied()`. |

Neither field is persisted — both are session-scoped runtime state, absent from the JSON blob.

Overloading a single `hydratedFromUser` was the original spec's defect: Phase 1 wanted it to mean
"the seed has not run yet" (init `false`) while Phase 3 wanted it to mean "a persisted value
exists, do not seed" (init `true` when persisted). Those initialisers are **direct contradictions**,
and this is the exact flag guarding H-12/R2 — *the most likely bug in the feature*. Splitting it
makes the Phase 3 predicate read as a single unambiguous sentence (Phase 3 step 1).

### D8 — Git baseline and gate scoping (DE Issue D)

| Option | Description |
|---|---|
| **A (recommended)** | One checkpoint commit of the completed overhaul, then a commit per phase; every `git diff` gate scoped to `HEAD`. |
| B | No commits; replace every `git diff` gate with a recorded `shasum` captured at baseline. |

The working tree does **not** start clean: the entire, finished CMO overhaul is uncommitted
(`src/index.css` modified, `src/features/dashboard/` untracked, `AppHeader.tsx` / `AppSidebar.tsx`
/ `navigation.ts` untracked, `src/features/auth/types.ts` modified, `.claude/artifacts/` untracked,
plus the **staged deletion** of the dotted `.claude/.artifacts/design/` pipeline store).

- **A pros:** every `git diff --stat HEAD -- <path>` gate becomes exactly the question the plan
  wants to ask — *"what did this phase change?"* — instead of being permanently non-empty and
  therefore meaningless. It makes the I-40 / R1 gate real again (a shadcn CSS write becomes
  distinguishable from the pre-existing overhaul diff), makes Phase 5's "exactly 11 modified files"
  and "components/ + pages/ empty" checks reliable, and gives per-phase rollback for free. The
  overhaul is complete and gate-green (`checkpoint.md:61-64,75` — build 0, 45 tests, lint 0 err/1
  warn, token-diff 15, "Build status: CLEAN"), so there is nothing half-finished being frozen in.
  **Cons:** committing is a **repository state change**, and the Operator must not make it
  unilaterally — see P0 step 2.
- **B pros:** touches nothing; works if the user wants no commits. **Cons:** hashes catch *whether*
  a file changed but not *what* changed, so a reviewer loses the diff; it cannot express
  "exactly 11 modified files in this directory"; and it needs a hash captured for every gated path
  up front, which is more bookkeeping than one commit.

**Recommended: A**, with B fully specified as the fallback (P0 step 5) because A requires the
user's consent and may not be granted.

---

## Baseline capture — run ONCE, before Phase 1

### Precondition P0 — establish a real baseline (DE Issue D) — **BLOCKING**

Every `git diff` gate in this plan is worthless until this is settled. Do it first.

**1. Observe. Do not change anything yet.**
```bash
cd /Users/valentinesamuel/Desktop/deyon/zelkora/zelkora_frontend
git status --porcelain
git log --oneline -3
```

**Expected (as of planning): the tree is NOT clean.** The completed CMO overhaul is uncommitted —
`src/index.css` modified · `src/features/dashboard/` untracked · `AppHeader.tsx` /
`AppSidebar.tsx` / `navigation.ts` untracked · `src/features/auth/types.ts` modified ·
`.claude/artifacts/` untracked · **a staged deletion of `.claude/.artifacts/design/`**.
Re-verify rather than trusting this paragraph — the tree may have moved since planning.

**2. If the tree is not clean: STOP and ask the user.**
> Committing is a repository state change. The Operator does **not** have standing to make it on
> the strength of this plan, a coordinator message, or a reviewer's suggestion. **Ask the user
> directly and wait for an explicit yes.** If the answer is no, or no answer comes, go to step 5
> (fallback B) — do not proceed with the `git diff` gates as written, and do not commit anyway.

Proposed message to the user, in substance: *the previous CMO overhaul (Phases 1–6) is complete
and green but entirely uncommitted; this feature's verification gates depend on being able to diff
against a known-good point; may I make one checkpoint commit of that finished work — including the
deliberate deletion of the `.claude/.artifacts/design/` pipeline store — before starting?*

**3. If green-lit: verify green BEFORE committing. Never commit a red tree.**
```bash
npm run build && npm test && npm run lint
node .claude/scripts/token-diff.mjs --theme src/index.css | tail -3
```
Expected: exit 0 · **45 passing** · **0 errors / 1 warning** (`EnrollMfaStep.tsx:78`) ·
token-diff **15**. `checkpoint.md:61-64` claims exactly these numbers, but a claim in a document is
not evidence — re-run them. **If any gate is red, stop and report.** A red baseline is a different
conversation, not a commit.

**4. Make ONE checkpoint commit, scoped deliberately.**
- **Include:** the overhaul's source, config and asset changes; `.claude/artifacts/` (all ten
  files); and the **staged deletion of `.claude/.artifacts/design/`** — that deletion *is* the
  intent of I-29, and committing makes it permanent rather than leaving it perpetually staged.
- **Exclude:** anything in `git status` that is *not* part of the overhaul or this planning work.
  Read the list. If something unexpected is there, **stop and ask** rather than sweeping it in —
  `git add -A` is how unrelated work gets committed under someone else's message.
- Message should say what it is: a checkpoint of the completed CMO Dashboard & UI Overhaul
  (Phases 1–6) plus the deliberate removal of the unused design-pipeline store, with the gate
  readings quoted.
- Then:
```bash
git status --porcelain     # -> EMPTY
git rev-parse HEAD         # -> record as BASELINE_SHA
```
Record `BASELINE_SHA` in `state.md`'s baseline block. **This is the feature baseline.**

**5. Fallback B — only if the user declines the commit.**
Then the tree stays dirty and `git diff` cannot be a gate. Substitute:
- Delete the "must be clean" precondition. It is unsatisfiable and would otherwise block every
  phase.
- Capture a hash for **every** gated path now, and record all of them in `state.md`:
```bash
shasum src/index.css components.json \
       src/app/layouts/AppHeader.tsx src/app/layouts/AppSidebar.tsx \
       src/features/dashboard/pages/CmoDashboardPage.tsx \
       .claude/artifacts/art-direction.md
shasum src/features/dashboard/api/*.api.ts
```
- Replace every `git diff --stat HEAD -- <path>` gate with "re-run `shasum <path>` and compare to
  the recorded value: **unchanged** where the gate said *empty*, **changed** where it said
  *modified*."
- Gates that count files (Phase 5 #9 "exactly 11 modified") become "these 11 hashes changed **and**
  no other hash in `src/features/dashboard/` did" — enumerate the directory with
  `shasum src/features/dashboard/**/*.ts*` at baseline to make that checkable.
- `git status --porcelain src/components/ui/` (Phase 2 #4) still works, because those files are
  committed. Keep it.

### After P0 — capture the rest of the baseline

```bash
npm run build && npm test && npm run lint
node .claude/scripts/token-diff.mjs --theme src/index.css | tail -3
ls -la dist/assets | sort -k5 -n | tail -20     # record entry chunk size
shasum src/index.css                            # record — the belt-and-braces I-40 gate
```

Record the entry-chunk size — Phase 2 adds runtime deps and must justify its delta.
Record the `src/index.css` hash: it must be **byte-identical at every phase boundary and at the
end of the feature** (I-40). This hash check works under *both* P0 outcomes, and it is the single
highest-risk gate in the feature (R1), so it is checked even under Option A where `git diff` is
also available.

**Also capture the 360px header baseline now** (`npm run dev`, DevTools 360×740, `/dashboard`):
record whether `AppHeader` already overflows or scrolls horizontally **before** a switcher is
added. Without this, F3-d is unattributable (H-5).

### Commit discipline for every phase (I-41)

1. Do the work.
2. Run the phase's verification criteria — **including the `git diff HEAD` gates, before
   committing.** At this moment `HEAD` is the previous phase's commit, so `git diff HEAD -- <path>`
   is precisely "what this phase changed".
3. Only when every gate passes, commit the phase and record the SHA in `state.md`.
4. Never amend or rebase a previous phase's commit — the SHAs are the audit trail the gates lean on.

Under fallback B, steps 3–4 are replaced by "record the updated hashes in `state.md`".

---

# Phase 1 — Filter foundation: BRANCHES, pure date resolver, store

**Objective.** Land every piece of pure, testable logic and the single source of truth, with
**no UI and no query changes**. This phase is where the whole feature's correctness lives.

### Rehydration context

- **P0 is complete**: either the working tree is clean at `BASELINE_SHA` (Option A) or the
  baseline hashes are recorded (fallback B). Every `git diff` gate below assumes Option A; under
  B, substitute the recorded-hash comparison per P0 step 5.
- Nothing in this phase renders. `noUnusedLocals` does not flag unused *exports*, so all new
  modules compile green while unmounted (this pattern is established — the overhaul's Phase 2
  shipped 11 unmounted components).
- Vitest: `environment: 'node'`, `include: ['src/**/*.test.ts']`, `@` → `./src`. New tests must be
  `.ts`. Existing suite: 45 passing.
- `src/features/auth/authStore.ts` is a plain `create()` store; `user` is `null` until
  `bootstrap()` resolves. **The store in this phase must not import `authStore`** — hydration from
  the user is a Phase 3 concern, kept out of the store to preserve module-eval-time init.
- The Phase 3 persistence precedent to mirror, from `AppSidebar.tsx`:
  ```ts
  function readCollapsed(): boolean {
    try { return localStorage.getItem('zelkora.sidebar.collapsed') === 'true'; } catch { return false; }
  }
  ```

### Steps

1. **Dependency.** `npm i date-fns@<exact>` — **pin the exact version, no caret** (I-35). If
   `ERESOLVE` fires, retry with `--legacy-peer-deps` and record which path was taken.
   `date-fns` is dependency-free and framework-agnostic, so a peer conflict is not expected —
   record the actual outcome regardless.
   > `react-day-picker` is **not** installed here. It arrives in Phase 2 with the calendar.

2. **`src/features/branch/branches.ts`** — a leaf module, imports nothing:
   ```ts
   export interface Branch { id: string; name: string; shortName: string }
   export const BRANCHES: readonly Branch[] = [ /* dev-branch FIRST (D6), ~4 entries */ ] as const;
   export const DEFAULT_BRANCH_ID = BRANCHES[0]!.id;
   export function isKnownBranchId(id: string): boolean
   export function branchNameFor(id: string): string | null   // null, never a raw id (I-38)
   ```
   `.ts`, not `.tsx` (I-22). Exactly one entry has `id: 'dev-branch'`, and it is index 0.
   Names should read as real facilities (e.g. "Zelkora Central Hospital" / "Central"), with
   `shortName` ≤ ~10 chars so the 360px trigger fits.

3. **`src/features/dashboard/filters/dateRange.ts` — the pure module (I-37).**
   No React. No `localStorage`. **No `new Date()` without an argument and no `Date.now()`.**
   `today` is always **injected as a `YYYY-MM-DD` string**. This is the single design move that
   makes the whole thing deterministically testable in a node env and immune to the tz/DST class
   of bug.
   ```ts
   export const PRESETS = ['today','last7','last30','last90','quarter','ytd','custom'] as const;
   export type PresetKey = (typeof PRESETS)[number];
   export interface RangeSelection { preset: PresetKey; from?: string; to?: string }
   export interface ResolvedRange { from: string; to: string; rangeKey: string; label: string }

   export const PRESET_LABELS: Record<PresetKey, string>;
   export const MAX_RANGE_DAYS = 366;

   export function resolveRange(sel: RangeSelection, today: string): ResolvedRange;
   export function normalizeSelection(raw: unknown, today: string): RangeSelection;  // self-heal
   ```
   - **All arithmetic via `date-fns`**: `parseISO` (local midnight), `subDays`, `startOfQuarter`,
     `startOfYear`, `differenceInCalendarDays`, `isValid`, `format(d, 'yyyy-MM-dd')`.
     **Never `toISOString()`** — it converts to UTC and shifts the date by one day at any non-zero
     offset (F1-a).
   - **Preset semantics — document these in a header comment; they are the test matrix:**
     | Preset | from | to |
     |---|---|---|
     | `today` | `today` | `today` |
     | `last7` | `today − 6d` | `today` |
     | `last30` | `today − 29d` | `today` |
     | `last90` | `today − 89d` | `today` |
     | `quarter` | `startOfQuarter(today)` | `today` (quarter **to date**) |
     | `ytd` | `startOfYear(today)` | `today` |
     | `custom` | `sel.from` | `sel.to` |
     The "last N" presets are **inclusive of today** — hence `N − 1`. State it, or someone will
     silently change it.
   - **`rangeKey` = `` `${from}_${to}` `` (D5). Always a plain string, never an object or `Date`
     (I-33).**
   - **`label`**: preset label for presets; for custom, `` `${format(f,'MMM d')} – ${format(t,'MMM d')}` ``
     using an **en-dash**, appending ` yyyy` when the range crosses a year boundary or does not sit
     in `today`'s year. Single-day custom range renders one date, not `Mar 3 – Mar 3`.
   - **`normalizeSelection` self-heal ladder** (each rule must have a test):
     1. Not an object / unknown `preset` → `{ preset: 'today' }`.
     2. `preset !== 'custom'` → drop any `from`/`to`.
     3. `custom` with a missing or non-`YYYY-MM-DD` or `!isValid` bound → `{ preset: 'today' }`.
     4. Reversed (`from > to`) → **swap**, keep `custom`.
     5. `to > today` → clamp `to` to `today`; if `from > today` too, clamp both.
     6. Span > `MAX_RANGE_DAYS` → clamp `from` to `to − (MAX_RANGE_DAYS − 1)`.
     `normalizeSelection` must be **idempotent**: `n(n(x)) === n(x)`. Test it.

4. **`src/features/dashboard/filters/dateRange.test.ts`** — pin `today` to a fixed literal
   (use one **not** near a month/quarter/year edge for the happy path, e.g. `'2026-08-30'`, and
   separate cases for the edges). Required coverage:
   - each of the six presets → exact `from`/`to`/`rangeKey`/`label`;
   - `quarter` at `'2026-07-01'` (first day of Q3 → from === to) and `'2026-06-30'` (last day of
     Q2 → from `'2026-04-01'`);
   - `ytd` at `'2026-01-01'` (from === to) and `'2026-12-31'`;
   - `last7`/`last30`/`last90` crossing a **month** boundary and a **year** boundary
     (`today = '2026-01-03'` → `last7.from === '2025-12-28'`);
   - a **leap-year** February span (`'2028-03-01'`, `last7.from === '2028-02-24'`);
   - custom happy path; custom **reversed** → swapped; custom **entirely in the future** →
     clamped; custom **oversized** → clamped to `MAX_RANGE_DAYS`; custom with a garbage string →
     `today`;
   - `normalizeSelection` on `null`, `undefined`, `'{}'`-parsed junk, unknown preset, and
     idempotency.

5. **`src/features/dashboard/filters/filtersPersistence.ts` — pure serde, no I/O.**
   ```ts
   export const FILTERS_STORAGE_KEY = 'zelkora.dashboard.filters';
   export interface PersistedFilters { v: 1; branchId: string; preset: PresetKey; from?: string; to?: string }

   export interface DecodedFilters {
     branchId: string;
     selection: RangeSelection;
     /** raw !== null — i.e. a stored value existed at all. */
     present: boolean;
     /** A PRESENT stored value had to be corrected. ALWAYS false when present === false. */
     healed: boolean;
   }

   export function decodeFilters(raw: string | null, today: string): DecodedFilters;
   export function encodeFilters(branchId: string, selection: RangeSelection): string;
   ```
   - `decodeFilters` does the `JSON.parse` **inside its own try/catch** (a malformed string is a
     throw, not a null), validates `branchId` with `isKnownBranchId` (falling back to
     `DEFAULT_BRANCH_ID`), and delegates the range to `normalizeSelection`.
   - **`present` and `healed` are two different questions and must never be conflated**
     (DE Issue C — the same class of defect as D7). `raw === null` → `{ present: false, healed:
     false }` and the defaults. `healed` means *"there was something stored and it was wrong"*.
   - `v: 1` is a version stamp; an unrecognised `v` on a present value heals to defaults
     (`present: true, healed: true`).
   - Sibling **`filtersPersistence.test.ts`** covering: `null` (**asserts `present: false` and
     `healed: false`**), `''`, `'not json'`, `'[]'`, `'{"v":2,...}'`, unknown `branchId`, a valid
     round-trip (`present: true, healed: false`), and `encodeFilters ∘ decodeFilters` fidelity.

6. **`src/features/dashboard/filters/dashboardFiltersStore.ts` — the only impure module.**
   ```ts
   export function todayIso(): string;                 // format(new Date(), 'yyyy-MM-dd') — the ONE impurity

   interface DashboardFiltersState {
     branchId: string;
     selection: RangeSelection;

     /** DE Issue A / D7 — two separate questions, two separate fields. Neither is persisted. */
     persistedOnInit: boolean;    // set ONCE at module-eval from decodeFilters().present; never mutated
     userSeedApplied: boolean;    // one-shot session guard; starts false; only markUserSeedApplied() flips it

     setBranchId(id: string): void;
     setSelection(sel: RangeSelection): void;
     markUserSeedApplied(): void;
   }

   export const useDashboardFiltersStore = create<DashboardFiltersState>()(...);
   export function useDashboardQueryScope(): { branchId: string; rangeKey: string; from: string; to: string };
   ```
   - **Init runs at module-eval time**, not in an effect: read `localStorage` once via a
     `try/catch`-wrapped `readRaw()`, pass to `decodeFilters(raw, todayIso())`, use the result as
     the store's initial state, and set `persistedOnInit: decoded.present`,
     `userSeedApplied: false`. Nothing flashes, and there is no mount-time write or extra render
     (the Phase 3 lesson, F3-d of the old plan).
   - **Write back at init if and only if `decoded.present && decoded.healed`** (DE Issue C).
     A genuinely bad stored value is corrected in storage immediately (I-38). A **fresh profile
     writes nothing** — an absent key stays absent until the user's first real `setBranchId` /
     `setSelection`. Writing defaults on first load would violate I-32b's "writes happen in the
     setter", and in private mode would re-attempt (and re-catch) a doomed write on every single
     load.
   - Each setter writes through: `writeRaw(encodeFilters(...))` in a `try/catch`, in the setter,
     **never in a `useEffect`**.
   - `setSelection` runs its argument through `normalizeSelection` before storing — the UI is not
     trusted to be the only writer.
   - `setBranchId` ignores an unknown id (no-op) rather than storing it.
   - `markUserSeedApplied()` sets `userSeedApplied: true` and **writes nothing to storage** — it is
     session state, not a preference.
   - **`useDashboardQueryScope()`** is the single read surface the 11 hooks will use in Phase 5.
     It selects `branchId` and `selection`, computes `today = todayIso()`, calls `resolveRange`,
     and **memoises on `(branchId, selection, today)`** so it returns a referentially stable
     object. Even if it did not, `rangeKey` is a primitive string and React Query hashes keys
     structurally — but memoising keeps `useQuery`'s options object stable and removes any doubt
     about I-36.
   - **This module must not import `authStore`** (see rehydration context).
   - `.ts` file (I-22).

7. Do **not** touch `src/index.css`, any `.api.ts`, `AppHeader`, `AppSidebar`,
   `CmoDashboardPage` or `DashboardFilterBar` in this phase.

**Affected files.** `package.json` + lockfile (M) · `src/features/branch/branches.ts` (A) ·
`src/features/dashboard/filters/dateRange.ts` (A) · `.../dateRange.test.ts` (A) ·
`.../filtersPersistence.ts` (A) · `.../filtersPersistence.test.ts` (A) ·
`.../dashboardFiltersStore.ts` (A)

**Expected behaviour.** No visible change whatsoever. Five new modules compile and are unmounted;
the test count rises well above 45. **A fresh profile's `localStorage` remains untouched.**

### Failure modes

- **F1-a — `toISOString()` timezone shift.** Any *local* `Date` formatted through `toISOString()`
  lands on the previous day west of Greenwich. **Mitigation: `date-fns` `format(d,'yyyy-MM-dd')`
  only. Grep gate:
  `grep -rn "toISOString" src/features/dashboard/filters src/features/branch` → no matches.**
- **F1-b — DST.** Adding/subtracting 24h-in-ms across a DST boundary lands at 23:00 or 01:00 and
  can roll the date. `subDays` is calendar-aware; **no manual millisecond arithmetic anywhere**.
- **F1-c — the pure module reaches for `new Date()`.** Then every test is non-deterministic and
  the quarter/YTD boundary cases become untestable. `today` is a **parameter**, always.
- **F1-d — `JSON.parse` throws outside the guard.** A corrupted value white-screens the app on
  boot, which is worse than the private-mode case because it persists across reloads.
  The parse lives inside `decodeFilters`' own `try/catch`.
- **F1-e — the two halves of the write-on-init condition get confused** (DE Issue C).
  Two distinct bugs live here, and they pull in opposite directions:
  - *Healing without rewriting* — a bad stored value is corrected in memory only, so it is
    re-read and re-healed on every load forever, and a future stricter reader may hard-fail on it.
  - *Rewriting when nothing was stored* — a brand-new user who has touched nothing gets the
    default blob persisted at first module-eval, which contradicts I-32b (writes belong in
    setters) and, in private mode, re-attempts a doomed write on every load.
  **The condition is exactly `decoded.present && decoded.healed`.** `decodeFilters` must return
  `healed: false` when `present` is `false`, so the two can never be conflated at the call site.
- **F1-f — quarter/YTD off-by-one.** `startOfQuarter(2026-07-01)` is `2026-07-01`, so
  `from === to` on the first day of a quarter. That is correct, looks like a bug, and must be an
  explicit test so nobody "fixes" it.
- **F1-g — persist-in-effect.** A `useEffect` writer fires on mount, costs an extra render, and
  can clobber a value written by another tab. Write in the setter.
- **F1-h — `react-refresh/only-export-components`.** All five new modules are `.ts`; if any of
  them is created as `.tsx`, lint fails (I-22).
- **F1-i — `MAX_RANGE_DAYS` chosen arbitrarily.** 366 is picked so "Year to date" and a full
  leap year both fit. If a preset could exceed it, the clamp would silently truncate a *valid*
  preset. Verify: no preset resolves to a span > 366 (YTD on Dec 31 of a leap year = 366).
- **F1-j — one flag doing two jobs** (DE Issue A / D7). `persistedOnInit` and `userSeedApplied`
  answer different questions with **contradictory correct initialisers**. If they are merged back
  into one boolean, either a returning user's explicit branch choice is overwritten on every load,
  or the seed never runs for a first-time user. Both fields must exist in Phase 1's store, even
  though only Phase 3 reads them — that is the point of defining them here.

### Verification criteria

1. `npm run build` exits 0 (proves the five modules typecheck under strict TS + `noUnusedLocals`).
2. `npm test` exits 0; the suite is **> 45** tests and includes named cases for: each of the six
   presets, quarter first/last day, YTD first/last day, month-boundary and year-boundary `last7`,
   leap-February, custom reversed → swapped, custom future → clamped, custom oversized → clamped,
   garbage → `today`, and `normalizeSelection` idempotency.
3. `npm run lint` exits 0 errors / 1 pre-existing warning.
4. `node .claude/scripts/token-diff.mjs --theme src/index.css` → count **15** (no UI added).
5. **`shasum src/index.css` → identical to the P0-recorded hash** (I-40). Under Option A also:
   `git diff --stat HEAD -- src/index.css` → **empty**.
6. `grep -rn "toISOString\|Date.now()" src/features/dashboard/filters src/features/branch` →
   **no matches**, except `todayIso()`'s single `new Date()` in `dashboardFiltersStore.ts`.
7. `grep -rn "new Date()" src/features/dashboard/filters/dateRange.ts` → **no matches** (I-37).
8. **`grep -n "persistedOnInit\|userSeedApplied" src/features/dashboard/filters/dashboardFiltersStore.ts`
   → both fields present and distinct.** `grep -rn "hydratedFromUser" src/` → **no matches**
   (the overloaded flag must not exist anywhere).
9. **`decodeFilters(null, today)` returns `{ present: false, healed: false }`** — asserted in
   `filtersPersistence.test.ts`, and the store's init write is guarded on `present && healed`.
10. `grep -c "localStorage" src/features/dashboard/filters/dashboardFiltersStore.ts` → every
    occurrence is inside a `try` block (exactly one reader and one writer helper).
11. `grep -n "persist" src/features/dashboard/filters/dashboardFiltersStore.ts` → no match
    (hand-rolled, not `zustand/middleware/persist`).
12. `grep -n "authStore" src/features/dashboard/filters/*.ts` → no match.
13. `grep -n '"date-fns"' package.json` → present, **exact version, no caret**.
14. `grep -rn "DashboardFilterBar" src/` → still 2 matches (import + usage). Phase 1 does not
    touch it.
15. **Under Option A:** `git diff --stat HEAD` shows only `package.json`, the lockfile and the
    five new files — nothing else. Then commit the phase and record the SHA in `state.md` (I-41).

---

# Phase 2 — UI primitives: `select`, `popover`, `calendar` + dependency audit

**Objective.** Add the three missing `components/ui` primitives, in the house idiom, generated by
a **fully non-interactive, version-pinned** CLI invocation, with the dependency and CSS surface
explicitly audited. **Nothing is wired into the app.**

### Rehydration context

- **P0 is complete and Phase 1 is committed** (Option A), so `HEAD` is the Phase 1 commit and
  `git diff HEAD -- <path>` means "what Phase 2 changed". Under fallback B, use the recorded
  hashes (P0 step 5).
- `src/components/ui/` currently has: `alert`, `button`, `card`, `checkbox`, `form`, `input-otp`,
  `input`, `label`, `skeleton`, `spinner`, `tooltip`. **`select.tsx`, `popover.tsx` and
  `calendar.tsx` do not exist** — verified. There is therefore nothing to overwrite.
- **The house idiom is the unified package.** `src/components/ui/tooltip.tsx:2`:
  `import { Tooltip as TooltipPrimitive } from "radix-ui"`. `TooltipContent` already wraps its
  content in `TooltipPrimitive.Portal` — copy that portal discipline for `PopoverContent` and
  `SelectContent`.
- **VERIFIED:** `node_modules/radix-ui/dist/index.d.mts` exports `Popover` (line 38) and `Select`
  (line 48). `radix-ui@^1.6.7` is already a dependency. **`select` and `popover` should add no new
  package at all.**
- **`components.json` sets `"css": "src/index.css"`** and `"tailwind.config": ""`. The shadcn CLI
  writes CSS variables into its `css` target. **I-18/I-40 forbid this.** Step 2 below neutralises
  it structurally rather than relying on an after-the-fact revert.
- **The CLI is `shadcn@^4.19.0` in `devDependencies`.** Its `add` command supports
  `-y, --yes` (skip the confirmation prompt), `-o, --overwrite`, `-c, --cwd <path>`,
  `-p, --path <path>`, `-s, --silent`, `--src-dir`/`--no-src-dir`,
  `--css-variables`/`--no-css-variables`.
- `recharts@^3.10.1` was installed in the overhaul with **no `ERESOLVE` and no
  `--legacy-peer-deps`** against React 19.2 (`D-cmo-ui-overhaul-3`) — React-19 peer-dep friction
  in this repo has been low. Do not assume; record.

### Steps

1. **Snapshot before the CLI runs.**
   ```bash
   git status --porcelain          # under Option A: EMPTY (Phase 1 is committed)
   git rev-parse HEAD              # = the Phase 1 SHA; a full revert is one command
   cp components.json /tmp/zelkora-components.json.bak
   shasum src/index.css            # must match the P0-recorded hash before we start
   ```

2. **Neutralise the `src/index.css` write target, then run the CLI non-interactively.**
   The CLI writes CSS variables into `components.json`'s `css` target. Rather than revert that
   write afterwards (and hope the diff is reviewable), **point it at a throwaway file for the
   duration of the run**:

   ```bash
   cd /Users/valentinesamuel/Desktop/deyon/zelkora/zelkora_frontend

   # 2a. Redirect the CLI's CSS target away from src/index.css.
   #     Edit components.json: "css": "src/index.css"  ->  "css": "src/__shadcn-scratch.css"
   #     Create an empty src/__shadcn-scratch.css so the CLI has somewhere to write.
   touch src/__shadcn-scratch.css

   # 2b. Generate, fully non-interactive, version-pinned, stdin closed.
   CI=1 npx --yes shadcn@4.19.0 add select popover calendar --yes --cwd . < /dev/null

   # 2c. Restore components.json verbatim and delete the scratch file.
   cp /tmp/zelkora-components.json.bak components.json
   rm -f src/__shadcn-scratch.css
   ```

   **Every flag is load-bearing — do not drop any of them:**
   | Token | Why |
   |---|---|
   | `CI=1` | Most prompt libraries (prompts/inquirer/clack) go non-interactive under `CI`. Belt. |
   | `npx --yes` | Suppresses npx's own *"Need to install the following packages… Ok to proceed?"* prompt. |
   | `shadcn@4.19.0` | **Pinned.** `@latest` makes the run irreproducible and can change the generated output between the executing agent and the reviewer. Match the `devDependencies` pin; if the installed version differs, use the installed one and record it. |
   | `add select popover calendar` | One invocation, three components. If it fails, fall back to three separate invocations so the failure is attributable. |
   | `--yes` | Skips the CLI's *"You are about to install the following components / dependencies. Proceed?"* confirmation. |
   | `--cwd .` | Pins the project root so the CLI cannot walk up and find another `components.json`. |
   | `< /dev/null` | **The hard backstop.** If any prompt is *not* suppressed, the command fails immediately on EOF instead of hanging the Operator forever. A hang is the worst outcome; a fast failure routes to step 3. |

   **`--overwrite` is deliberately NOT passed.** The three target files do not exist, so there is
   nothing to overwrite; passing it would arm the CLI to clobber an existing `components/ui` file
   on any name collision, silently, with `--yes` suppressing the warning. Absence of the flag is
   the safety net (F2-g).

   **Prompts this command can still emit, and the required answer:**
   | Prompt | Suppressed by | Required answer if it appears |
   |---|---|---|
   | npx *"Need to install… Ok to proceed?"* | `npx --yes` | yes |
   | *"You are about to install the following components. Proceed?"* | `--yes` | yes |
   | *"…the following dependencies will be installed. Proceed?"* | `--yes` | yes |
   | *"File `select.tsx` already exists. Overwrite?"* | file absence | **no** — stop and investigate; a collision means the rehydration context is stale |
   | *"No `components.json` found. Configure?"* / base-color / style / registry | `components.json` exists at `--cwd .` | **must not appear.** If it does, `--cwd` resolved wrong — stop |
   | package-manager selection | lockfile detection (`package-lock.json` present) | npm |

3. **Fallback if any prompt cannot be suppressed, or the command fails on EOF.**
   Do **not** retry interactively and do **not** guess at answers. Instead generate out-of-tree
   and copy in by hand:
   ```bash
   mkdir -p /tmp/zelkora-shadcn && cd /tmp/zelkora-shadcn
   npm init -y
   cp <repo>/components.json .          # the ORIGINAL, then set "css" to "./scratch.css"
   mkdir -p src/components/ui src/lib && touch scratch.css
   # minimal tsconfig.json with the "@/*" -> "./src/*" path so the CLI resolves aliases
   CI=1 npx --yes shadcn@4.19.0 add select popover calendar --yes --cwd . < /dev/null
   ```
   Then copy **only** `src/components/ui/{select,popover,calendar}.tsx` into the repo and run the
   full Phase 2 audit (steps 4–6) on them exactly as if the CLI had run in-tree. This path
   structurally cannot touch `src/index.css`, `components.json` or `package.json` — the
   `react-day-picker` install is then done by hand in step 4.
   **Third fallback:** if the registry is unreachable entirely, stop and report. Do not hand-write
   a `Select`/`Popover` — D2 rejected that on a11y grounds and the reasoning does not change
   because a network call failed.

4. **Audit the dependency diff — `git diff HEAD -- package.json`.** Required end state:
   - `react-day-picker` — **new**, pinned to an **exact** version (no caret). If step 3's fallback
     was used, install it here: `npm i react-day-picker@<exact>`.
   - `date-fns` — already present from Phase 1; if the CLI bumped or caret-ified it, restore the
     exact pin.
   - **`@radix-ui/react-select` / `@radix-ui/react-popover` must NOT be present.** If the CLI
     added either, **remove the package and rewrite the generated import** to
     `import { Select as SelectPrimitive } from "radix-ui"` /
     `import { Popover as PopoverPrimitive } from "radix-ui"`, matching `tooltip.tsx`. Shipping
     both the unified package and a per-primitive package duplicates Radix at runtime and can
     produce two context instances.
   - **Record whether `--legacy-peer-deps` was needed.** If the install fails on `ERESOLVE`,
     install `react-day-picker@<exact> --legacy-peer-deps` manually first, then re-run the CLI.

5. **Confirm the theme file and config are untouched.**
   `shasum src/index.css` must still match the P0-recorded hash, and (Option A)
   `git diff HEAD -- src/index.css` and `git diff HEAD -- components.json` must both be **empty**,
   with `src/__shadcn-scratch.css` gone. If the calendar genuinely requires a token that does not
   exist, **stop and flag it to the user** as an explicit I-18 exception — do not add it silently
   (it would also need a `.dark` counterpart, I-6, and an `art-direction.md` amendment).

6. **Normalise the generated files to house style:**
   - imports from `"radix-ui"` (step 4);
   - `Content` components wrapped in the matching `*Primitive.Portal` (F4-f, portal clipping);
   - **no non-component export in a `.tsx`** — if `calendar.tsx` or `select.tsx` exports a
     variants object or helper, move it to a sibling `.ts` or make it module-local (I-22);
   - **no Tailwind arbitrary values for design decisions** — the generated `calendar.tsx` in
     particular tends to ship `w-[--cell-size]`-style classes. `var(--…)` forms are permitted;
     literal `size-[36px]`/`text-[11px]` forms are not (I-7). token-diff is the gate.
   - **reduced motion:** any `data-[state=open]:animate-in` / `zoom-in-95` on
     `PopoverContent`/`SelectContent` must degrade. The global backstop at the bottom of
     `src/index.css` should cover it; **verify it actually applies to these classes** rather than
     assuming (H-9). If it does not, add `motion-reduce:transition-none` /
     `motion-reduce:animate-none` **on the component**, never by editing `index.css`.
   - **do not import `react-day-picker/style.css`** anywhere — shadcn's `calendar.tsx` styles
     entirely through `classNames` overrides; importing rdp's stylesheet would fight the theme and
     inject unthemed colours.

7. **Do not wire anything.** No `AppHeader`, no `CmoDashboardPage`, no feature file changes.

**Affected files.** `package.json` + lockfile (M) · `src/components/ui/select.tsx` (A) ·
`src/components/ui/popover.tsx` (A) · `src/components/ui/calendar.tsx` (A)
**Transient, must not survive the phase:** `components.json` (M→restored) ·
`src/__shadcn-scratch.css` (A→deleted)

**Expected behaviour.** No visible change. Three unmounted primitives compile.

### Failure modes

- **F2-a — `react-day-picker` peer-dep failure on React 19.** Pin exact + `--legacy-peer-deps`,
  and **record which path was taken** in `decisions.md` (I-35), exactly as `D-cmo-ui-overhaul-3`
  recorded recharts. If rdp v9 will not install, the fallback is *not* a hand-rolled calendar —
  it is to ship Phase 4 presets-only behind a disabled "Custom…" item and escalate to the user.
- **F2-b — the CLI adds `@radix-ui/react-select`/`-popover` alongside the unified `radix-ui`.**
  Two copies of Radix, two context instances, a bigger bundle, and a divergence from
  `tooltip.tsx`. Caught by `git diff HEAD -- package.json`; fixed by rewriting the import.
- **F2-c — the CLI writes into `src/index.css`.** `components.json` points its `css` target
  there. Step 2a makes this structurally impossible for the duration of the run; step 5 is the
  verification that it worked. **Gate: the `src/index.css` hash is unchanged from P0, and
  `git diff HEAD -- src/index.css` is empty.**
- **F2-c2 — the scratch redirection is left in place.** `components.json` still pointing at
  `src/__shadcn-scratch.css`, or the scratch file surviving into the phase commit, breaks the
  *next* person to run the CLI and leaves a mystery file in `src/`. Both are explicit verification
  items — and under Option A the phase commit would make them permanent, so check before committing.
- **F2-d — `react-refresh/only-export-components`.** A generated `.tsx` exporting a non-component
  fails `npm run lint` (I-22).
- **F2-e — arbitrary values from the generator.** `calendar.tsx` is the likeliest source of a
  token-diff regression in this whole feature. Gate is a hard count ≤ 15.
- **F2-f — bundle regression.** `react-day-picker` + `date-fns` are real weight. Measure the
  entry-chunk delta against the baseline. If the calendar is eagerly in the entry chunk, that is
  a Phase 4 lazy-loading requirement (F4-g), not a Phase 2 blocker — but measure it here.
- **F2-g — the CLI overwrites an existing file.** Mitigated by *not* passing `--overwrite` and by
  the three targets being verified absent. `git status --porcelain src/components/ui/` at phase
  end must show exactly three new files and **no modification to any existing one**.
- **F2-h — the command hangs on an unsuppressed prompt.** This is the executability failure the
  whole step-2 contract exists to prevent. `< /dev/null` converts a hang into an immediate EOF
  failure, which routes to the step-3 out-of-tree fallback. **Never "fix" a hang by dropping
  `< /dev/null` and answering by hand** — the run must stay reproducible.

### Verification criteria

1. `npm run build`, `npm test`, `npm run lint` exit 0 / 0 err + 1 warn.
2. `node .claude/scripts/token-diff.mjs --theme src/index.css` → count **≤ 15**.
3. **`shasum src/index.css` → identical to the P0-recorded hash.** Under Option A also:
   **`git diff --stat HEAD -- src/index.css` → empty** and
   **`git diff HEAD -- components.json` → empty**.
   **`ls src/__shadcn-scratch.css` → no such file.**
4. `git status --porcelain src/components/ui/` → exactly three added entries, **no `M`**.
   (This gate works under both P0 outcomes — those files are committed either way.)
5. `grep -n "@radix-ui/react-" package.json` → **no matches**.
6. `grep -n 'from "radix-ui"' src/components/ui/select.tsx src/components/ui/popover.tsx` →
   one match each.
7. `grep -n "Primitive.Portal" src/components/ui/select.tsx src/components/ui/popover.tsx` →
   present in both `Content` components.
8. `grep -n "react-day-picker" package.json` → present, **exact version, no caret**.
   `grep -rn "react-day-picker/style.css" src/` → **no matches**.
9. Every value export in `src/components/ui/calendar.tsx` is a React component (types are fine).
10. `npm run build && ls -la dist/assets | sort -k5 -n | tail -20` — record the entry-chunk delta
    vs. the P0 baseline in `state.md`, with an explicit recommendation on F4-g/Q4.
11. `grep -rn "from 'recharts'" src/` → still exactly the three chart files (no collateral).
12. The exact command that was run, the CLI version, and whether the step-3 fallback was needed
    are recorded for `D-cmo-branch-filter-2`.
13. **Under Option A:** `git diff --stat HEAD` shows only `package.json` + lockfile as modified and
    the three `components/ui` files as new. Then commit the phase and record the SHA (I-41).

---

# Phase 3 — `BranchSwitcher` in the header + branch name in the sidebar footer

**Objective.** Make the branch selection real and visible. The store value changes; query keys do
not yet (Phase 5), so there is no data effect — that is expected.

### Rehydration context

- **Phases 1 and 2 are committed** (Option A), so `HEAD` is the Phase 2 commit.
- Phase 1 shipped `src/features/branch/branches.ts` (`BRANCHES`, `DEFAULT_BRANCH_ID`,
  `isKnownBranchId`, `branchNameFor`) and
  `src/features/dashboard/filters/dashboardFiltersStore.ts` with **two distinct init flags**
  (D7 / DE Issue A):
  | Field | Meaning | Initial value |
  |---|---|---|
  | `persistedOnInit` | a stored value existed at module-eval (`decodeFilters().present`) | computed once, **never mutated** |
  | `userSeedApplied` | the one-shot post-auth user seed has run this session | `false` |
  Neither is persisted. `markUserSeedApplied()` flips only the second.
- Phase 2 shipped `src/components/ui/select.tsx`.
- **`AppHeader.tsx` (58 lines)** — right cell is
  `<div className="flex items-center justify-self-end">` containing only the Bell button
  (`size-8 rounded-sm`, focus ring `focus-visible:outline-2 focus-visible:outline-ring
  focus-visible:outline-offset-2`). The centre cell is a **fixed `h-8 w-60`** search button. Grid
  is `grid-cols-[1fr_auto_1fr]`, `h-14`, `px-4`.
- **`AppSidebar.tsx:273-283`** — the `{!collapsed && ...}` footer branch:
  ```tsx
  <p className="truncate text-xs text-muted-foreground">
    {user?.role ?? '—'}
    {user?.branchId != null && ` · ${user.branchId}`}
  </p>
  ```
  `user` remains used by line 276 (`fullName`) and 279 (`role`) after the change — no
  `noUnusedLocals` risk.
- **Chrome rule** (`AppLayout.tsx`): chrome files "do not fetch domain data, hold domain state, or
  implement feature behaviour". `app/` MAY import `features/`. `authStore` is already imported by
  both chrome files, so importing a feature *component* is strictly less coupling than the status
  quo.
- `authStore.status` starts `'loading'`; `user` is `null` until `bootstrap()` resolves.
- The Phase-1 store **does not** know about `user` — hydration is this phase's job.

### Steps

1. **`src/features/branch/useBranchHydration.ts`** — a `.ts` hook (I-22), the only place the
   filters store and `authStore` meet. The predicate is **exactly this**, and it reads as one
   unambiguous sentence precisely because the two questions have two fields (D7):

   ```ts
   // in a useEffect:
   if (!userSeedApplied && user !== null) {
     markUserSeedApplied();                       // one-shot, unconditional — the seed "has been considered"
     if (!persistedOnInit) {                      // only seed when the user had NO stored preference
       setBranchId(
         isKnownBranchId(user.branchId ?? '') ? user.branchId! : DEFAULT_BRANCH_ID,
       );
     }
   }
   ```

   Read the three values with `useDashboardFiltersStore` selectors and `user` from `useAuthStore`.
   Note the ordering: `markUserSeedApplied()` fires **unconditionally** once `user` is non-null, so
   the effect is a true one-shot regardless of which branch of the inner `if` runs. It must
   **never** write `authStore` (I-31).

   **Why two fields and not one** — the two questions have contradictory correct initialisers:
   `persistedOnInit` must be `true` for a returning user (so the seed is skipped), while
   `userSeedApplied` must be `false` for *everyone* at session start (so the one-shot can fire).
   A single boolean cannot hold both, and collapsing them is precisely how H-12/R2 ships:
   a returning user's explicit branch choice gets silently overwritten by `user.branchId` on every
   load. `setBranchId` is a no-op for an unknown id, so a corrupt `user.branchId` cannot poison the
   store even if the `isKnownBranchId` guard were dropped — but keep the guard, it is the readable
   defence.

2. **`src/features/branch/BranchSwitcher.tsx`** — a feature component:
   - calls `useBranchHydration()` (so the chrome stays dumb);
   - `useDashboardFiltersStore` for `branchId` / `setBranchId`;
   - renders `Select` from `@/components/ui/select`, `value={branchId}`,
     `onValueChange={setBranchId}`, one `SelectItem` per `BRANCHES` entry showing `name`;
   - **trigger label:** `shortName` always visible; the full `name` appears at `sm:` and up.
     Implement with two spans — `<span className="sm:hidden">{shortName}</span>` +
     `<span className="hidden sm:inline truncate">{name}</span>` — not a JS breakpoint read
     (no `matchMedia`, no resize listener, no hydration mismatch).
   - trigger classes track the Bell/search siblings: `h-8`, `rounded-sm`, `border`, `text-sm`,
     `min-w-0`, `truncate`, and the **exact** existing focus-ring triple
     `focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2` (I-15).
     No literal arbitrary widths (I-7).
   - `aria-label="Switch branch"` on the trigger (the visible label is a value, not a name);
     Radix Select already gives listbox semantics, typeahead and roving focus.
   - Renders nothing (or a disabled trigger) while `BRANCHES.length < 2` — a one-branch
     deployment should not show a dead control. `BRANCHES` has ~4, so this is defensive only.
   - `.tsx` exporting **only** the component (I-22).

3. **`src/features/branch/BranchLabel.tsx`** — a 10-line feature component rendering
   `{name ? \` · ${name}\` : null}` from `branchNameFor(branchId)`. Exists so `AppSidebar` gains
   a subscription-free element rather than a store hook (chrome rule). Returns `null` — never a
   raw id — when the name is unknown (I-38).

4. **`AppHeader.tsx`** — add exactly one import and one element, **left of the Bell**:
   ```tsx
   <div className="flex min-w-0 items-center gap-2 justify-self-end">
     <BranchSwitcher />
     <button …Bell… className="… shrink-0 …" />
   </div>
   ```
   `gap-2`, `min-w-0` on the wrapper, `shrink-0` on the Bell. **No store code, no query code, no
   new state in this file** (I-39).

5. **`AppSidebar.tsx:280`** — replace
   `{user?.branchId != null && \` · ${user.branchId}\`}` with `<BranchLabel />`.
   One import added. Nothing else in the file changes; `collapsed` still gates the whole block.

6. **360px header sizing.** Compare against the P0 360px capture. If the header now overflows
   *and* did not before, the fix ladder, in order:
   a. `min-w-0` + `truncate` on the switcher trigger (already in step 2);
   b. shrink the trigger to icon+shortName only below `sm`;
   c. **only if a and b fail** — hide the centre search button below `sm`
      (`hidden sm:flex` on it). This is a chrome behaviour change: **record it as
      `D-cmo-branch-filter-<n>` and call it out to the user**, do not slip it in.

**Affected files.** `src/features/branch/useBranchHydration.ts` (A) ·
`src/features/branch/BranchSwitcher.tsx` (A) · `src/features/branch/BranchLabel.tsx` (A) ·
`src/app/layouts/AppHeader.tsx` (M, +1 import +1 element +1 wrapper div) ·
`src/app/layouts/AppSidebar.tsx` (M, +1 import, 1 line replaced)

**Expected behaviour.** A branch select sits in the header's right cell, left of the bell.
Changing it updates the store and the sidebar footer label immediately and persists across
reload. A **first-time** user gets `user.branchId` seeded once after auth resolves; a **returning**
user's stored choice is never touched. **No data changes** — the 11 queries are not keyed yet.
That is correct for this phase.

### Failure modes

- **F3-a — a returning user's persisted branch is overwritten by `user.branchId` on every load.**
  **The single most likely bug in this feature** (H-12 / R2). It has one cause: the two init
  questions being answered by one flag (D7 / F1-j). The guard is `persistedOnInit` — a value that
  is computed **once** from `decodeFilters().present` and **never mutated**, and is therefore
  still `true` on the second, third and hundredth render after auth resolves. If someone
  "simplifies" `useBranchHydration` by reusing `userSeedApplied` for both roles, or by deriving
  `persistedOnInit` from the current store contents instead of the init snapshot, the bug returns
  silently — the switcher still *works*, it just forgets.
  **Test: pick branch #3 → reload → still #3.** Then clear storage → reload → seeded from
  `user.branchId`.
- **F3-b — the switcher writes `authStore`.** Explicitly forbidden (I-31). `User` is server
  truth; the switcher is a client-side view preference. Grep the phase diff for
  `useAuthStore.setState` / `authStore` outside `useBranchHydration.ts`.
- **F3-c — auth race.** On a cold load the store initialises to `DEFAULT_BRANCH_ID` before `user`
  resolves. With `dev-branch` at index 0 (D6) the seeded user's id already matches, so nothing
  re-keys. For a *different* first-time user, the seed fires once after auth and the branch flips —
  visible for one frame. Acceptable; from Phase 5 it costs one refetch, absorbed by
  `keepPreviousData`.
- **F3-d — header overflow at 360px.** `grid-cols-[1fr_auto_1fr]` with a fixed `w-60` centre and
  now two controls on the right. **Attribute honestly against the P0 capture** (H-5) — the
  `w-60` search button may already overflow at 360px without any switcher.
- **F3-e — chrome gains domain logic.** `AppHeader` must gain **only** an import and an element.
  A `useDashboardFiltersStore` call in `AppHeader.tsx` breaks I-39 and the documented layout rule.
- **F3-f — `SelectContent` clipped or mispositioned.** The header has `border-b` and siblings with
  `overflow` semantics. `SelectPrimitive.Portal` (Phase 2 step 6) is the defence — verify the
  content renders as a child of `<body>` in DevTools, not inline in the header.
- **F3-g — focus ring lost.** The shadcn `radix-nova` `SelectTrigger` ships its own
  `focus-visible:ring-*`; the repo's convention is `outline-2 outline-ring outline-offset-2`
  (I-15). Match the siblings so the header does not have two focus-ring vocabularies.
- **F3-h — sidebar footer renders a raw id.** If `branchNameFor` returns `null` the component
  renders nothing. It must never fall back to printing the id — that is the exact wart being
  removed.
- **F3-i — `useBranchHydration` in a `.tsx`.** It is a hook, not a component; a `.tsx` file
  exporting it trips `react-refresh/only-export-components` (I-22).
- **F3-j — the seed effect fires more than once.** If `markUserSeedApplied()` is called inside the
  inner `if (!persistedOnInit)` instead of unconditionally, a returning user never marks the seed
  as applied, so the effect re-evaluates on every `user` identity change for the whole session.
  Harmless today (the inner branch never runs) but it is a latent loop the moment the inner
  condition changes. Call it unconditionally, as written in step 1.

### Verification criteria

1. `npm run build`, `npm test`, `npm run lint` → 0 / 0 / 0 err + 1 warn.
2. token-diff count ≤ **15**. **`shasum src/index.css` unchanged from P0**; under Option A also
   `git diff --stat HEAD -- src/index.css` → empty.
3. **`git diff --stat HEAD -- src/app/layouts/AppHeader.tsx`** → small (≈ +4/−1) and confined to
   the right cell. `grep -n "useDashboardFiltersStore\|useQuery\|useState" src/app/layouts/AppHeader.tsx`
   → **no matches** (I-39).
   *Under fallback B:* the recorded `AppHeader.tsx` hash changed, and read the file to confirm the
   change is only the wrapper + element + import.
4. `grep -rn "authStore\|useAuthStore" src/features/branch/` → matches **only** in
   `useBranchHydration.ts`, and only as a **read** (I-31).
5. **`grep -n "persistedOnInit" src/features/branch/useBranchHydration.ts` → present, and it is
   read from the store, never recomputed from current state.**
   **`grep -rn "hydratedFromUser" src/` → no matches.**
6. `grep -n "user.branchId" src/app/layouts/AppSidebar.tsx` → **no matches**.
7. `grep -rn "DashboardFilterBar" src/` → still 2 matches (untouched this phase).
8. **Under Option A:** `git diff --stat HEAD` lists exactly the five files in *Affected files* —
   nothing under `src/features/dashboard/` or `src/components/`. Then commit and record the SHA.
9. **Manual** (`npm run dev`, seeded `dev-cmo`) — deferred to the E2E pass, same posture as the
   overhaul:
   - switcher is in the header right cell, **left of the bell**;
   - trigger shows `shortName` at 360px and the full `name` at ≥ 640px;
   - select another branch → sidebar footer shows that branch's **name**, not an id;
   - **returning-user path (F3-a):** pick branch #3 → reload → **still #3**;
   - **first-time path:** clear `zelkora.dashboard.filters` → reload → branch seeded from
     `user.branchId` (`dev-branch`);
   - **fresh-profile storage (DE Issue C):** clear the key, load the app, **do not touch the
     switcher** → in DevTools Application → Local Storage, `zelkora.dashboard.filters` is **still
     absent**. Then change the branch once → the key appears;
   - corrupt the value to `{"v":1,"branchId":"nope","preset":"nope"}` → reload → **app renders,
     falls back to the default branch and `today`, and the stored value is rewritten** (I-38);
   - set the value to `not json` → reload → app renders, no white screen (F1-d);
   - Safari private mode (or DevTools → block storage) → app renders, switcher works in-session;
   - keyboard: Tab reaches the trigger with a visible ring; `Enter`/`Space`/`↓` opens; `↑`/`↓`
     move; typing "c" jumps by first letter; `Enter` selects; `Esc` closes and returns focus;
   - screen reader announces the control name and the selected option;
   - light **and** dark mode;
   - 1440 / 1024 / 768 / **360** — no header overflow, no horizontal scroll on `/dashboard`;
   - `prefers-reduced-motion: reduce` (DevTools → Rendering) → no select open/close animation.

---

# Phase 4 — `DateRangeControl`, delete `DashboardFilterBar`, restructure the page header

**Objective.** Ship a working date-range control on the dashboard header row and remove the
visual-only filter bar **in the same phase** (I-20).

### Rehydration context

- **Phases 1–3 are committed** (Option A), so `HEAD` is the Phase 3 commit.
- `CmoDashboardPage.tsx`: **line 7** imports `DashboardFilterBar`, **line 116** renders it.
  Header block, lines 107–114:
  ```tsx
  <header className="min-w-0">
    <h1 className="font-display text-2xl font-semibold tracking-tight">Operations Overview</h1>
    <p className="text-sm text-muted-foreground">
      Monitor capacity, flow, and performance across the health system.
    </p>
  </header>
  ```
  Section order after the header: `KpiCardRow` → 2-up charts → `FinancialBillingWidget` →
  2-up (TodaysAppointments + QualitySafety) → `SectionHeading "System status"` → 3-col band.
  Page wrapper: `<div className="flex min-w-0 flex-col gap-6 p-6">`.
- **`DashboardFilterBar.tsx`'s sole consumer is `CmoDashboardPage`** (grep-verified). Nothing else
  imports it. Its `FILTERS` constant, Radix tooltip and `<div tabIndex={0}>` wrapper all go.
- **I-1 holds: `CmoDashboardPage` has no page-level state and no hoisted query.** A zustand store
  read is **not** a query and **not** page state — but `DateRangeControl` must own its own store
  subscription; the page must not hoist one and pass it down, and must not gain a `useQuery`.
- Phase 1 shipped `resolveRange`, `PRESETS`, `PRESET_LABELS`, `RangeSelection`,
  `useDashboardFiltersStore` (`selection`, `setSelection`), `todayIso`. Phase 2 shipped
  `popover.tsx` and `calendar.tsx`.
- Directional styling cue: the attached ecommerce sample — a **bordered pill trigger showing the
  resolved range label** (e.g. `Mar 3 – Mar 9`), clean and muted. **Out of scope:** the sample's
  "Facility Snapshot" table, "Edit Dashboard" button and kebab menu.
- The global `prefers-reduced-motion` backstop lives at the bottom of `src/index.css` — do not
  edit it (I-17/I-40).

### Steps

1. **`src/features/dashboard/filters/DateRangeControl.tsx`** — the pill trigger:
   - reads `selection` + `setSelection` from the store, `today = todayIso()`, label from
     `resolveRange(selection, today).label`;
   - trigger: `Popover` + `PopoverTrigger asChild` on a `<button>` styled as a bordered pill —
     `h-9 rounded-sm border bg-card px-3 text-sm`, a `CalendarDays` lucide icon (`size-4`,
     `aria-hidden`), the label, and a `ChevronDown`. `aria-label="Change date range"`, plus the
     resolved label as the accessible value. Focus ring: the house triple (I-15);
   - `PopoverContent align="end"` containing a **preset list** (six items + "Custom…") as a
     vertical list of `<button>`s (or a Radix `RadioGroup`) with the current one marked
     `aria-current="true"` / a check glyph;
   - choosing a preset → `setSelection({ preset })` and **close the popover**;
   - choosing "Custom…" → swap the popover body to the calendar view (do **not** open a second
     popover — nested portals are a focus-management trap). A "← Presets" back control returns.
2. **The custom calendar view** — `Calendar` in `mode="range"`, `numberOfMonths={2}` at `sm:` and
   up, **`numberOfMonths={1}` below `sm`** (two months do not fit in 360px), `disabled={{ after: today }}`
   so a future range cannot be picked in the first place (belt *and* braces with
   `normalizeSelection`), and `defaultMonth` set to the current `from`. Commit on the second click
   (`range.from && range.to`) via `setSelection({ preset: 'custom', from, to })`, then close.
   Emit dates with `format(d,'yyyy-MM-dd')` — **never `toISOString()`** (F1-a).
3. **Restructure the page header** into a right-aligned row:
   ```tsx
   <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
     <div className="min-w-0">
       {/* h1 + subtitle — byte-identical to lines 108-113 */}
     </div>
     <DateRangeControl />
   </header>
   ```
   Stacking below `sm` is what keeps 360px safe. **The `<h1>` and `<p>` markup and classes must
   not change** — same `font-display text-2xl font-semibold tracking-tight`, same subtitle text.
4. **Delete `DashboardFilterBar`** — remove `src/features/dashboard/components/DashboardFilterBar.tsx`,
   remove its import (line 7) and its usage (line 116), **in this same phase** (I-20).
   `grep -rn DashboardFilterBar src/` must return nothing before the phase is done.
5. **Section order below the header is unchanged.** The `gap-6` between header and `KpiCardRow`
   now absorbs the space the filter bar occupied — verify the page does not read as top-heavy.
6. **No page-level state or query in `CmoDashboardPage`** (I-1). `DateRangeControl` owns its own
   store subscription.
7. **Reduced motion:** the popover's `data-[state=open]:animate-in` and the calendar's month
   transition must be suppressed. Prefer the global backstop; if it does not reach these classes,
   add `motion-reduce:animate-none` / `motion-reduce:transition-none` **on the components**
   (I-17) — never edit `src/index.css` (I-40).

**Affected files.** `src/features/dashboard/filters/DateRangeControl.tsx` (A, possibly + a
module-local `DateRangePresetList` / `DateRangeCalendar` split — each `.tsx` exporting components
only) · `src/features/dashboard/pages/CmoDashboardPage.tsx` (M, header block + 2 lines removed) ·
`src/features/dashboard/components/DashboardFilterBar.tsx` (**D**)

**Expected behaviour.** The dashboard header row shows the title/subtitle on the left and a
bordered date-range pill on the right, reading "Today" by default. Opening it shows six presets +
"Custom…"; picking one changes the label and persists. **No data changes yet** — keys are wired in
Phase 5. The old filter bar is gone.

### Failure modes

- **F4-a — the deletion orphans its import** and `tsc -b` fails (I-20). Import, usage and file go
  together, in one commit.
- **F4-b — the header restructure regresses the h1.** Wrapping the title in a flex row is where
  `font-display`, `text-2xl`, `tracking-tight` or the subtitle quietly get "tidied". Diff those
  two elements character by character.
- **F4-c — a hoisted query or page state sneaks in** (I-1). Nothing about a date control requires
  either.
- **F4-d — 360px.** Two calendar months are ~560px wide. `numberOfMonths` must be responsive, and
  `PopoverContent` needs viewport containment. Note: `max-w-[calc(100vw-2rem)]` **is** an
  arbitrary value — prefer Radix's `--radix-popover-content-available-width` custom property
  (`var(--…)` forms are token-diff exempt, I-7).
- **F4-e — reversed / future range reaches the store.** The calendar's `disabled={{ after: today }}`
  plus `normalizeSelection` in the setter are two independent defences. Do not remove either.
- **F4-f — portal clipping.** `PopoverContent` must portal to `<body>`. The page wrapper is a
  flex column with `p-6`; an inline popover clips at the card edge (the same class of bug as
  F3-f).
- **F4-g — the calendar lands in the entry chunk.** `react-day-picker` is only needed when a user
  chooses "Custom…". Prefer `lazy(() => import('./DateRangeCalendar'))` with a `Suspense`
  fallback **sized to the calendar's loaded height** so the popover does not resize under the
  cursor — the same discipline recharts got (I-8's spirit, `D-cmo-ui-overhaul-3`). Use the Phase 2
  entry-chunk measurement to decide whether this is required or merely nice.
- **F4-h — keyboard trap in the popover.** Radix manages focus, but the preset-list ⇄ calendar
  view swap can strand focus on an unmounted node. Move focus explicitly to the first element of
  the newly shown view, and confirm `Esc` closes and returns focus to the trigger from **both**
  views.
- **F4-i — reduced motion not honoured** by the popover/calendar animation classes (I-17). Verify
  with DevTools → Rendering → *Emulate `prefers-reduced-motion: reduce`*, do not assume the global
  backstop covers `animate-in`/`zoom-in-95`.
- **F4-j — the label lies.** The trigger must always render `resolveRange(selection, today).label`,
  not a value cached at selection time — otherwise "Today" shows yesterday's date after midnight.
- **F4-k — token-diff regression** from pill/calendar arbitrary values (I-7).
- **F4-l — screen-reader silence on the calendar.** `mode="range"` selection state must be
  announced. rdp v9 handles grid semantics; add an `aria-live="polite"` line echoing the resolved
  label after a selection so the change is announced by the *control*, not only the grid.

### Verification criteria

1. `npm run build`, `npm test`, `npm run lint` → 0 / 0 / 0 err + 1 warn.
2. **`grep -rn DashboardFilterBar src/` → no output.**
   `ls src/features/dashboard/components/DashboardFilterBar.tsx` → no such file.
   Under Option A, `git status --porcelain` shows it as **deleted** (`D`) before the phase commit.
3. token-diff count ≤ **15**. **`shasum src/index.css` unchanged from P0**; under Option A also
   `git diff --stat HEAD -- src/index.css` → empty.
4. **`git diff HEAD -- src/features/dashboard/pages/CmoDashboardPage.tsx`** — the `<h1>` and
   subtitle `<p>` lines are unchanged except for indentation; section order below the header is
   untouched. *Under fallback B:* read the two elements against the values quoted in this phase's
   rehydration context, character by character.
5. `grep -n "useQuery\|useState\|useReducer" src/features/dashboard/pages/CmoDashboardPage.tsx`
   → **no matches** (I-1).
6. `grep -rn "toISOString" src/features/dashboard/filters/` → **no matches**.
7. `npm run build && ls -la dist/assets | sort -k5 -n | tail -20` — record whether
   `react-day-picker` is in the entry chunk or a lazy chunk; state the decision in `state.md`.
8. **Under Option A:** `git diff --stat HEAD` lists only `CmoDashboardPage.tsx` (M), the deleted
   `DashboardFilterBar.tsx` (D) and the new control file(s) (A). Then commit and record the SHA.
9. **Manual** (deferred to the E2E pass):
   - default label reads **"Today"** on a fresh profile;
   - each preset produces the documented window and label; the pill updates immediately;
   - "Custom…" opens a **two-month** calendar at ≥ 640px and **one month** at 360px;
     future dates are not selectable; picking a reversed pair is impossible or self-heals;
   - selection persists across reload (both preset and custom `from`/`to`);
   - a corrupted stored `preset` self-heals to "Today" without a white screen;
   - keyboard: Tab to the pill (visible ring) → `Enter` opens → `↑`/`↓` through presets → `Enter`
     selects and closes with focus returned; into "Custom…" → arrow keys move by day,
     `PageUp`/`PageDown` by month, `Enter` selects both bounds; `Esc` closes from both views;
   - screen reader announces the trigger name, the selected preset, and the resolved range after
     a custom selection;
   - light **and** dark: pill border, muted label and calendar selected/range-middle states are
     all legible;
   - 1440 / 1024 / 768 / **360** — the header row stacks below `sm`, the popover never overflows
     the viewport, no horizontal scroll;
   - `prefers-reduced-motion: reduce` → no popover fade/zoom, no calendar month animation.

---

# Phase 5 — Data-layer plumbing: key all 11 queries by `(branchId, rangeKey)`

**Objective.** Make branch and range selection actually drive the data layer. Eleven identical
mechanical edits. This is the phase where the feature becomes real.

### Rehydration context

- **Phases 1–4 are committed** (Option A), so `HEAD` is the Phase 4 commit and
  `git diff --stat HEAD -- src/features/dashboard/api/` is exactly "what Phase 5 changed".
  **This is the gate that Issue D made possible** — before the P0 checkpoint commit,
  `src/features/dashboard/` was entirely untracked and the "exactly 11 modified files" check
  could not run at all.
- **All 11 `.api.ts` files are structurally identical 18-line files** (verbatim `edFlow.api.ts` in
  the Global rehydration context above). Hook names:
  `useAccessControl`, `useDashboardKpis`, `useDischargeReadiness`, `useEdFlow`, `useHmoClaims`,
  `useQualitySafety`, `useRecentActivity`, `useRevenueBilling`, `useSystemAlerts`,
  `useSystemHealth`, `useTodaysAppointments`. All take **zero arguments** today; **D4 keeps it
  that way**.
- `src/features/dashboard/api/fixtures.test.ts` imports **fixtures only, never hooks** — this
  phase does not touch it.
- Phase 1 shipped `useDashboardQueryScope(): { branchId, rangeKey, from, to }` in
  `src/features/dashboard/filters/dashboardFiltersStore.ts` — memoised, all primitives.
- **React Query v5**: the v4 option `keepPreviousData: true` **was removed**. The v5 form is
  `import { keepPreviousData } from '@tanstack/react-query'` used as
  `placeholderData: keepPreviousData`.
- **I-1 must survive:** each widget still owns its own query, its own loading/error/empty state.
  Nothing about this phase hoists anything.

### Steps

1. **In each of the 11 `<name>.api.ts`**, apply exactly this shape (using `edFlow` as the model):
   ```ts
   import { keepPreviousData, useQuery } from '@tanstack/react-query';

   import type { EdFlowResponse } from '@/features/dashboard/types/edFlow.types';
   import { delay } from '@/features/dashboard/api/delay';
   import { edFlowFixture } from '@/features/dashboard/api/edFlow.fixtures';
   import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

   // BACKEND SWAP: replace the queryFn body with
   //   return apiRequest<EdFlowResponse>(
   //     `/dashboard/ed-flow?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
   //   );
   // `scope` is already in hand from useDashboardQueryScope(); only the queryFn body changes.
   // Put any snake_case->camelCase transform here.
   export function useEdFlow() {
     const scope = useDashboardQueryScope();

     return useQuery({
       queryKey: ['dashboard', 'edFlow', scope.branchId, scope.rangeKey] as const,
       queryFn: async (): Promise<EdFlowResponse> => {
         await delay(300);
         return edFlowFixture;
       },
       placeholderData: keepPreviousData,
     });
   }
   ```
2. **`noUnusedLocals` caveat — why the scope stays an object.** If `from` and `to` were
   destructured they would be unused while the fixture is returned, and `noUnusedLocals` flags
   unused destructured locals. Keeping one `scope` object means nothing is unused, all four values
   remain available, and the BACKEND SWAP comment stays literally accurate. **Apply this shape
   uniformly to all 11.** Do not use `void from;` or similar suppressions.
3. **Update the BACKEND SWAP comment in every file** to the real call, with the resource's actual
   path segment (`/dashboard/ed-flow`, `/dashboard/hmo-claims`, etc. — read the existing comment,
   do not invent the path). **Fix the "Nothing else in this file changes" line** — it is now false;
   replace it with wording that says the `queryFn` body is the only edit and the scope values are
   already in hand.
4. **Do not change** any `queryFn` behaviour, any fixture, any type, or `fixtures.test.ts`.
   `delay(300)` stays.
5. **Do not change any call site.** Under D4 there are zero caller edits. If any call site needs a
   change, D4 has been violated — stop and re-read.
6. **`rangeKey` and `branchId` are the only new key segments, and both are plain strings** (I-33).
   No `Date`, no object, no array.

**Affected files.** All 11 of `src/features/dashboard/api/*.api.ts` (M). Nothing else.

**Expected behaviour.** Changing the branch or the date range re-keys all 11 queries; each
refetches once behind `keepPreviousData`, so the previously-loaded content stays on screen and the
board **does not flash to skeletons**. The rendered numbers are identical (fixtures are
branch/range-agnostic by design) — the observable proof is in React Query devtools, not on the page.

### Failure modes

- **F5-a — wrong React Query v5 API.** `keepPreviousData: true` is a **v4** option and was
  removed in v5; it will silently do nothing. The correct form is
  `placeholderData: keepPreviousData` with the value **imported** from `@tanstack/react-query`.
  Verify by grep, in all 11.
- **F5-b — `keepPreviousData` imported but unused in a file** → `noUnusedLocals` build failure.
  All-or-nothing across the 11.
- **F5-c — destructuring the scope** reintroduces unused `from`/`to` locals → build failure.
  See step 2.
- **F5-d — `as const` narrowing.** `['dashboard','edFlow', scope.branchId, scope.rangeKey] as const`
  where `branchId: string` yields `readonly ['dashboard','edFlow', string, string]`, which
  satisfies React Query's `readonly unknown[]`. This is **fine** — but if `branchId` were typed as
  a union of `BRANCHES` ids, a downstream `queryClient.setQueryData` call with a plain `string`
  would stop compiling. Keep the store's `branchId` as `string` (it is), and confirm no
  `getQueryData`/`setQueryData`/`invalidateQueries` call site in the repo asserts the old
  **2-element** key shape: `grep -rn "\['dashboard'" src/ --include=*.ts --include=*.tsx`.
- **F5-e — refetch storm.** Any of these turns one switch into a loop (I-36): a `Date` object or
  an unmemoised object in the key; a `queryFn` that writes the store; a `useEffect` that calls
  `setSelection` on every render. Verify in devtools: **one** fetch per query per switch, and the
  number of in-flight queries returns to zero.
- **F5-f — skeleton flash despite `placeholderData`.** If a widget branches on `isFetching`
  instead of `isPending`, it will still show a skeleton on every switch. `keepPreviousData` keeps
  `isPending === false` and sets `isPlaceholderData === true`. Audit the 11 widget consumers'
  loading predicates **without changing them** unless one is wrong; if one is, fix it here and say
  so.
- **F5-g — I-1 regression.** No widget may be collapsed into a shared query or a shared error
  guard. `FinancialBillingWidget` deliberately runs two independent queries.
- **F5-h — partial staleness during a switch.** With `keepPreviousData`, 11 queries resolve at
  slightly different times, so for ~300 ms some widgets show new data and some old. Because
  fixtures are identical across branches this is invisible today, and because widgets are
  independent (I-1) it is acceptable in principle. **Record it** — with a real backend it becomes
  a visible inconsistency and may need an `isPlaceholderData` opacity/`aria-busy` treatment.
- **F5-i — the BACKEND SWAP comment is left stale.** Eleven files, one boilerplate comment. The
  whole value of the comment is that the next engineer trusts it; a comment that says "nothing
  else in this file changes" when the URL now needs three params is worse than no comment.
- **F5-j — someone adds per-branch fixtures.** Out of scope by resolved requirement. The `queryFn`
  body does not change in this phase.

### Verification criteria

1. `npm run build`, `npm test` (**45 + Phase 1's new tests, all passing**), `npm run lint` →
   0 / 0 / 0 err + 1 warn.
2. `grep -c "queryKey" src/features/dashboard/api/*.api.ts` → **1 per file, 11 files.**
3. `grep -n "queryKey" src/features/dashboard/api/*.api.ts` → **every** line is a 4-element array
   whose 3rd and 4th elements are the branch id and the range key (I-33).
4. `grep -rn "\['dashboard', '[a-zA-Z]*'\] as const" src/` → **no matches** (no 2-element
   dashboard key survives).
5. `grep -c "placeholderData: keepPreviousData" src/features/dashboard/api/*.api.ts` → **1 per
   file, 11 files.** `grep -rn "keepPreviousData: true" src/` → **no matches** (F5-a).
6. `grep -c "keepPreviousData" src/features/dashboard/api/*.api.ts` → **2 per file** (import +
   use).
7. `grep -rn "useDashboardQueryScope" src/features/dashboard/api/ | wc -l` → **11**.
8. `grep -n "BACKEND SWAP" src/features/dashboard/api/*.api.ts` → 11 matches; spot-read three of
   them and confirm the URL carries `branch`, `from` and `to`, and that no file still claims
   "Nothing else in this file changes" if that is no longer true.
9. **`git diff --stat HEAD -- src/features/dashboard/api/` → exactly 11 modified files**;
   `fixtures.test.ts`, `delay.ts` and every `.fixtures.ts` **absent from the diff**.
   *Under fallback B:* the 11 recorded `*.api.ts` hashes changed and **no other hash** under
   `src/features/dashboard/` did (compare against the baseline enumeration from P0 step 5).
10. **`git diff --stat HEAD -- src/features/dashboard/components/ src/features/dashboard/pages/`
    → empty** (D4: zero caller churn), unless F5-f required a documented loading-predicate fix.
    *Under fallback B:* every recorded hash in those two directories is unchanged.
11. **Under Option A:** `git diff --stat HEAD` lists exactly 11 files, all under
    `src/features/dashboard/api/`. Then commit and record the SHA.
12. **Manual** (deferred to the E2E pass), with React Query devtools open:
    - switch branch → all 11 keys change their 3rd segment; **exactly 11 fetches**, then idle;
    - the board keeps its previous content throughout — **no full-board skeleton flash**;
    - switch date range → all 11 keys change their 4th segment; same behaviour;
    - switch back to a previously-used branch/range → served from cache, no skeleton at all;
    - both selections persist across reload and the keys come back with the persisted values;
    - resilience unchanged (I-1): temporarily `throw` in `edFlow.api.ts`'s `queryFn` → only that
      chart card errors; the rest of the board renders. **Revert, and confirm
      `git diff HEAD -- src/features/dashboard/api/edFlow.api.ts` shows only the intended change**
      — a debugging `throw` committed by accident is exactly what a scoped diff catches;
    - no runaway network activity while idle (I-36).

---

# Phase 6 — Record decisions, refresh the artifact store

**Objective.** Append this feature's decisions to the existing log and bring the state artifacts
up to date. Documentation only.

### Rehydration context — READ FIRST

- **Phases 1–5 are committed** (Option A), each with a recorded SHA in `state.md`.
- `.claude/artifacts/` (**no dot**) holds: `plan.md` (this file), `state.md`,
  `dependency-graph.json`, `invariants.md`, `working-hypotheses.md`, `agent-map.md`,
  `art-direction.md`, `decisions.md`, plus `diff.md` and `checkpoint.md`.
  **After P0 these are tracked**, which is what makes criterion 4 below a real gate — before the
  checkpoint commit, `.claude/artifacts/` was untracked and `git diff` on it returned nothing
  regardless of what changed.
- **`decisions.md`, `diff.md`, `checkpoint.md` and `art-direction.md` are the historical record of
  the completed overhaul. Do NOT delete or rewrite them.** `decisions.md` is **append-only** —
  `D-cmo-ui-overhaul-1..7` stay exactly as they are.
- **Never** write under the dotted `.claude/.artifacts/` (I-29). **Never** run
  `validate-manifest.mjs` (I-30). Never copy structure from `.claude/templates/design/`.

### Steps

1. **Append** `## D-cmo-branch-filter-<n>` sections to `.claude/artifacts/decisions.md`, below the
   existing seven, one paragraph each:
   - **-1** — Store shape and location (D1) **and the two-flag init model (D7)**: one zustand
     store at `src/features/dashboard/filters/dashboardFiltersStore.ts` holding
     `{ branchId, selection }` plus two **session-only, non-persisted** flags — `persistedOnInit`
     (set once from `decodeFilters().present`, never mutated) and `userSeedApplied` (the one-shot
     post-auth guard). Record why one boolean could not serve both: the correct initialisers are
     contradictory, and merging them silently overwrites a returning user's branch choice on every
     load. One localStorage key `zelkora.dashboard.filters`; hand-rolled `try/catch` persistence
     rather than `zustand/middleware/persist` (matching the `AppSidebar` collapse precedent);
     writes in setters, not effects; init at module-eval time; and **the init write-back is guarded
     on `present && healed`, so a fresh profile persists nothing until the user's first real
     change**.
   - **-2** — `select`/`popover` came from shadcn **and added no dependency**, because the
     already-installed unified `radix-ui@1.6.7` exports both primitives; the generated files use
     `from "radix-ui"` to match `tooltip.tsx`. **Record the exact non-interactive command that was
     run** (CLI version pin, `--yes`, `--cwd`, `CI=1`, `< /dev/null`), whether the
     `components.json` CSS-target redirection was used, whether the out-of-tree fallback was
     needed, and whether the CLI tried to add `@radix-ui/react-*`.
   - **-3** — `react-day-picker@<exact>` + `date-fns@<exact>` added and pinned. **Record whether
     `--legacy-peer-deps` was needed** against React 19.2 (the same protocol
     `D-cmo-ui-overhaul-3` used for recharts), the entry-chunk delta, and whether the calendar was
     lazy-loaded.
   - **-4** — Date semantics: `today` is injected as a `YYYY-MM-DD` string so the resolver is pure
     and node-testable; all arithmetic via `date-fns`; `toISOString()` banned; "last N" presets are
     inclusive of today; "This quarter"/"YTD" are to-date; `MAX_RANGE_DAYS = 366`; the self-heal
     ladder; and `decodeFilters` reporting `present` and `healed` as **two separate questions**.
   - **-5** — `rangeKey = ${from}_${to}` (D5), and why a bare preset name would have been a
     midnight-rollover cache bug.
   - **-6** — Hook contract (D4): store-read inside the hook via a single `scope` object, no
     signature change, zero caller churn; why the "more testable" explicit-args option buys nothing
     in a node-only, `.test.ts`-only vitest setup (I-21); and why the scope stays an object rather
     than being destructured (`noUnusedLocals`).
   - **-7** — `DashboardFilterBar` deleted; the dashboard header restructured into a
     title-left / range-right row; Facility and Service line dropped entirely.
   - **-8** — `placeholderData: keepPreviousData` on all 11 queries; the accepted tradeoff of
     partial staleness during a switch (F5-h).
   - **-9** — **Version-control baseline (D8 / DE Issue D).** Record that the completed CMO
     overhaul was uncommitted when this feature started; that the user green-lit a single
     checkpoint commit (**quote `BASELINE_SHA`**) which also made the `.claude/.artifacts/design/`
     deletion permanent; and that every phase thereafter ended in its own commit so each phase's
     `git diff HEAD` gates were meaningful. **If the user declined**, record that fallback B
     (recorded hashes) was used instead and that no commits were made — a future reader must not
     assume the SHAs exist.
   - **-10** — *(only if it happened)* any chrome behaviour change forced by the 360px header
     ladder (Phase 3 step 6c).
   Number them consecutively; do not renumber the overhaul entries.
2. **Rewrite `.claude/artifacts/state.md`** for this feature: current phase, the per-phase gate
   readings (build / test count / lint / token-diff / entry-chunk size / **phase SHA**), the
   dependency table, assumptions, risks, and which open questions closed.
3. **Refresh `working-hypotheses.md`** — move each hypothesis to VERIFIED or FALSIFIED with the
   evidence, and carry forward anything still open (notably R18/H-17 from the overhaul, still owed
   at E2E).
4. **Do not touch** `art-direction.md`. This feature introduces no new art direction: it reuses
   existing tokens, the existing radius scale and the existing focus-ring vocabulary. **If that
   turned out to be false in any phase, that is an I-40 exception that should already have been
   escalated** — record it here rather than silently amending the art direction.

**Affected files.** `.claude/artifacts/decisions.md` (M, **append-only**) ·
`.claude/artifacts/state.md` (M) · `.claude/artifacts/working-hypotheses.md` (M)

**Expected behaviour.** Documentation only. Zero effect on the build.

### Failure modes

- **F6-a — writing to the dotted `.claude/.artifacts/`** (I-29). One character apart from the
  correct path, and it re-creates the store the user deliberately deleted — which the P0 checkpoint
  commit has just made permanently deleted.
- **F6-b — rewriting `decisions.md` instead of appending.** The overhaul's seven entries are
  institutional memory. Append below them.
- **F6-c — running `validate-manifest.mjs`** and then "fixing" its complaint by creating a
  manifest (I-30). There is no manifest, by decision.
- **F6-d — recording the peer-dep, CLI and baseline outcomes from the plan instead of from what
  happened.** Read `package.json`, the install log and `git log`; do not retype an expectation.
  In particular, `D-cmo-branch-filter-9` must state which P0 branch was actually taken.
- **F6-e — quietly amending `art-direction.md`** to legitimise a token added during Phase 2 or 4.
  A new token is an escalation, not a documentation task.

### Verification criteria

1. `ls .claude/artifacts/` → `plan.md`, `state.md`, `dependency-graph.json`, `invariants.md`,
   `working-hypotheses.md`, `agent-map.md`, `art-direction.md`, `decisions.md`, `diff.md`,
   `checkpoint.md`.
2. `ls .claude/.artifacts 2>/dev/null` → **absent**. Under Option A, also confirm the deletion is
   committed: `git log --oneline -- .claude/.artifacts` shows the P0 checkpoint commit and
   `git status --porcelain .claude/.artifacts` is empty.
3. `grep -c '^## D-cmo-ui-overhaul-' .claude/artifacts/decisions.md` → still **7**.
   `grep -c '^## D-cmo-branch-filter-' .claude/artifacts/decisions.md` → **9 or 10**, consecutive.
4. **`git diff HEAD -- .claude/artifacts/art-direction.md` → empty.**
   *Caveat:* this gate assumes `.claude/` is tracked, which the staged deletion of
   `.claude/.artifacts/design/` implies and the P0 commit confirms. **If `.claude/` turns out to be
   gitignored, this gate is silently vacuous** — fall back to comparing a `shasum` of
   `art-direction.md` recorded at P0.
5. `grep -n '{\.\.\.}' .claude/artifacts/*.md` → no matches.
6. The pinned versions quoted in `D-cmo-branch-filter-3` match `package.json` verbatim; the command
   quoted in `-2` matches what was actually run; and `BASELINE_SHA` quoted in `-9` matches
   `git log`.
7. `npm run build` still exits 0 (nothing under `.claude/` is compiled — sanity check).
8. **Under Option A:** commit the documentation phase and record the final SHA in `state.md`.

---

## End-to-end verification (after Phase 6)

```bash
cd /Users/valentinesamuel/Desktop/deyon/zelkora/zelkora_frontend
npm install
npm run build          # tsc strict + noUnusedLocals clean; vite build succeeds
npm test               # 45 baseline + the Phase 1 date/persistence suites, all green
npm run lint           # 0 errors / 1 pre-existing warning (EnrollMfaStep.tsx:78)
node .claude/scripts/token-diff.mjs --theme src/index.css   # count <= 15

grep -rn "DashboardFilterBar" src/                          # -> nothing
grep -rn "hydratedFromUser" src/                            # -> nothing (the overloaded flag)
grep -rn "from 'recharts'" src/                             # -> still only the 3 chart files
grep -n "queryKey" src/features/dashboard/api/*.api.ts      # -> 11 four-element keys
grep -c "placeholderData: keepPreviousData" src/features/dashboard/api/*.api.ts  # -> 1 each
grep -rn "keepPreviousData: true" src/                      # -> nothing (v4 API)
grep -rn "toISOString" src/features/dashboard/filters src/features/branch  # -> nothing
grep -n "@radix-ui/react-" package.json                     # -> nothing

# Theme integrity — works under BOTH P0 outcomes:
shasum src/index.css                                        # -> identical to the P0-recorded hash

ls src/__shadcn-scratch.css 2>/dev/null                     # -> absent
ls .claude/artifacts/                                       # -> 10 files
ls .claude/.artifacts 2>/dev/null                           # -> absent
```

**Under Option A only** — the whole-feature diff, which is the strongest single check that nothing
unintended was swept in across six phases:
```bash
git diff --stat <BASELINE_SHA>..HEAD
git diff <BASELINE_SHA>..HEAD -- src/index.css components.json    # -> both EMPTY
git log --oneline <BASELINE_SHA>..HEAD                            # -> 6 phase commits
git status --porcelain                                            # -> EMPTY
```

`validate-manifest.mjs` is intentionally not run.

Then `npm run dev` as the seeded `dev-cmo` user, walking the manual checklists in Phases 3, 4 and
5 — switcher placement · **returning-user branch persistence (F3-a)** · **fresh-profile writes
nothing until first change (Issue C)** · sidebar branch name · preset and custom range behaviour ·
self-heal of corrupted storage · private-mode storage · key changes without a skeleton flash ·
keyboard traversal and focus rings · screen reader · light + dark · 1440 / 1024 / 768 / 360 with
no horizontal scroll · reduced motion on select, popover and calendar.
