# Invariants — Zelkora Global Branch Switcher & Working Date Range

Rules that must hold **after every phase**, not just at the end. A phase that breaks one is not
done, regardless of whether the build is green.

Numbering continues the CMO UI Overhaul's `I-1..I-30`. Overhaul invariants that this feature can
still break are **carried forward** below; the rest remain true of the shipped code but are not at
risk here.

**Revision:** DE review rounds 1–2 applied — I-31b (two init flags), I-32c (no write-on-init for a
fresh profile), **I-41 (baseline + HEAD-scoped gates)**; I-40's gate tightened to a hash comparison
that survives either P0 outcome.

---

## New — this feature

### Single source of truth

- **I-31 — `{ branchId, selection }` has exactly one owner:
  `src/features/dashboard/filters/dashboardFiltersStore.ts`.** Not the URL, not React context,
  not component state, not the `User` object. **The switcher never writes `authStore`** — `User`
  is server truth; the active branch is a client-side view preference. `user.branchId` is read
  **once**, only as an initial seed when nothing was persisted, and only from
  `useBranchHydration.ts`.
  *At risk in Phase 3* — the tempting wrong implementation is
  `useAuthStore.setState({ user: {...user, branchId} })`.

- **I-31b — The two init questions have two separate fields. Never one.**
  | Field | Question it answers | Initial value | Mutation |
  |---|---|---|---|
  | `persistedOnInit` | "Was there a stored value at module-eval time?" | `decodeFilters().present`, computed **once** | **never mutated** |
  | `userSeedApplied` | "Has the one-shot post-auth user seed run this session?" | `false`, always, for everyone | flipped exactly once by `markUserSeedApplied()` |

  Neither is persisted — both are session-scoped runtime state and must not appear in the JSON
  blob. **The correct initialisers are contradictory** (`persistedOnInit` is `true` for a returning
  user; `userSeedApplied` is `false` for *every* user at session start), which is precisely why a
  single boolean cannot serve both. Merging them is how H-12/R2 ships: a returning user's explicit
  branch choice is silently overwritten by `user.branchId` on every load, and the switcher appears
  to work while quietly forgetting.
  `persistedOnInit` must be read from the **init snapshot**, never re-derived from current store
  contents. **Gate: `grep -rn "hydratedFromUser" src/` returns nothing.**

- **I-38 — A persisted value that is no longer valid self-heals; it never throws and never
  renders raw.** An unknown `branchId` falls back to `DEFAULT_BRANCH_ID`; an unknown/invalid/
  reversed/future/oversized range falls back or clamps per the documented ladder; **and a healed
  value that was genuinely stored is written back immediately**, so the bad value is not re-healed
  on every load forever. See I-32c for the exact write condition — healing and persisting-defaults
  are different acts. `branchNameFor` returns `null`, never the id — the sidebar footer must
  render nothing rather than fall back to the raw id it is replacing.

### Storage

- **I-32 — Every `localStorage` access is wrapped in `try/catch`, read **and** write, and the
  `JSON.parse` is inside the guard.** Safari private mode and embedded webviews throw on access;
  a corrupted stored string throws on parse and would persist a white screen across reloads. This
  is the `readCollapsed`/`writeCollapsed` pattern from `AppSidebar.tsx`
  (`D-cmo-ui-overhaul-6`), hand-rolled — **not** `zustand/middleware/persist`.
- **I-32b — One key: `zelkora.dashboard.filters`.** Both fields, one JSON blob, one version stamp.
  Writes happen **in the setter**, never in a `useEffect` (an effect writer fires on mount, costs
  an extra render, and can clobber another tab). The read happens **once at module-eval time** so
  nothing flashes on first paint.
- **I-32c — The app never writes storage just because it started.** The init write-back fires
  **if and only if `decoded.present && decoded.healed`** — i.e. only to correct a value that was
  genuinely stored and genuinely wrong. A brand-new user who has touched nothing leaves
  `localStorage` untouched; the key first appears on their first real `setBranchId` /
  `setSelection`. Persisting defaults at boot would contradict I-32b (writes belong in setters),
  and in private mode would re-attempt a doomed write on every single load.
  **`decodeFilters` must return `healed: false` whenever `present` is `false`**, so the two can
  never be conflated at the call site. `present` and `healed` are two different questions — the
  same class of defect as I-31b.

### Query layer

- **I-33 — Every dashboard query key is the 4-tuple `['dashboard', '<name>', branchId, rangeKey]`.
  No un-keyed dashboard query may remain.** All key segments are **plain strings** — never a
  `Date`, never an object, never an array. A `Date` in a key re-hashes on every render and turns
  one switch into an infinite loop.
- **I-34 — All 11 dashboard queries carry `placeholderData: keepPreviousData`,** with
  `keepPreviousData` **imported** from `@tanstack/react-query`. The v4 spelling
  `keepPreviousData: true` was removed in v5 and silently does nothing — it is a correctness bug,
  not a style choice.
- **I-36 — A branch or range switch causes exactly one refetch per query, then idle.** No
  cache-busting loop, no `queryClient.clear()`, no `refetchInterval`, no `Date.now()` in a key, no
  effect that writes the store on render. 11 × `delay(300)` in parallel behind `keepPreviousData`
  is acceptable; a storm is not.
- **I-9 (carried) — Data-layer changes are additive until the consuming component is swapped.**
  No `queryFn` behaviour, fixture or type changes in Phase 5. `delay(300)` stays.

### Pure logic

- **I-37 — `dateRange.ts` and `filtersPersistence.ts` are pure.** No React, no DOM, no
  `localStorage`, no `Date.now()`, **no `new Date()` without an argument**. `today` is always
  **injected as a `YYYY-MM-DD` string**. All date arithmetic goes through `date-fns` calendar
  helpers; **`toISOString()` is banned** in `src/features/dashboard/filters/` and
  `src/features/branch/` (it converts to UTC and shifts the date by one day at any non-zero
  offset). Manual millisecond arithmetic is banned (DST). The single sanctioned impurity is
  `todayIso()` in `dashboardFiltersStore.ts`.
  This is the direct successor to **I-13** (`format.ts` stays pure) and exists for the same
  load-bearing reason: it is the only part of this feature vitest can actually test.

### Dependencies & tooling

- **I-35 — New runtime dependencies are pinned to an exact version, and the React-19 peer-dep
  path is recorded in `decisions.md`** (`--legacy-peer-deps` or not) — the same protocol
  `D-cmo-ui-overhaul-3` used for recharts. **Prefer the already-installed unified `radix-ui`
  package over any per-primitive `@radix-ui/react-*`**: shipping both duplicates Radix at runtime
  and can produce two context instances. `grep -n "@radix-ui/react-" package.json` must return
  nothing.
- **I-35b — Every code-generator invocation is non-interactive, version-pinned and reproducible.**
  The Operator runs without a TTY. Any `npx shadcn add` (or equivalent) must carry an explicit
  version pin, the flags that suppress every prompt, and `< /dev/null` as a hard backstop so an
  unsuppressed prompt **fails fast instead of hanging**. Prompts the command can still emit are
  enumerated in the phase with their required answers. **A hang is never resolved by dropping the
  backstop and answering by hand** — that makes the run irreproducible and the reviewer cannot
  confirm what was generated. `--overwrite` is not passed unless a file is knowingly being
  replaced; the absence of the target files is the safety net.
- **I-28 (carried) — No new runtime dependency ships as a side effect of tooling.** If the shadcn
  CLI adds a package the code does not import, it comes back out before the phase completes.

### Version control & gate integrity

- **I-41 — Every verification gate must be able to fail.** A gate that cannot distinguish success
  from failure is worse than no gate: it manufactures confidence. Concretely:
  - **A baseline is established before Phase 1 (P0).** The working tree does **not** start clean —
    the completed CMO overhaul is uncommitted — so `git diff --stat src/index.css` is *already*
    non-empty and every `git diff` gate in this plan is vacuous until P0 resolves it.
  - **Committing is a repository state change and requires the user's explicit authorisation.**
    Not the plan's, not a coordinator's, not a reviewer's. The Operator asks and waits. If consent
    is withheld, fallback B (recorded `shasum` comparisons) applies and the "tree must be clean"
    precondition is dropped rather than ignored.
  - **Under Option A: one commit per phase, and every `git diff` gate is scoped to `HEAD`**
    (`git diff HEAD -- <path>`), so it asks "what did *this phase* change" rather than "what has
    changed since the repo began". **Gates run before the phase commit**, never after. A completed
    phase's commit is never amended or rebased — the SHAs recorded in `state.md` are the audit
    trail the gates lean on.
  - **A gate whose precondition is unmet must be reported, not skipped.** If `.claude/` turns out
    to be gitignored, Phase 6's `git diff -- art-direction.md` check passes for the wrong reason
    (A13); say so and substitute a hash.
  - **The P0 commit is scoped deliberately.** `git add -A` on a tree carrying six phases of
    uncommitted work plus a staged deletion is how unrelated work gets committed under someone
    else's message (R20). Read the `git status` list; on anything unexpected, stop and ask.

### Theme

- **I-40 — `src/index.css` is not modified by this feature.** This includes shadcn CLI
  side-effects: `components.json` sets `"css": "src/index.css"`, so `npx shadcn add` writes there
  by default. Phase 2 neutralises this **structurally** (redirect the CLI's `css` target to a
  scratch file for the duration of the run, then restore `components.json` verbatim) rather than
  relying on an after-the-fact revert.
  **Primary gate — `shasum src/index.css` is byte-identical to the P0-recorded hash at every phase
  boundary and at feature end.** This works under *both* P0 outcomes, which is why it is the
  primary rather than the `git diff`: it is the highest-risk gate in the feature (R1) and must not
  depend on a consent decision. Under Option A, `git diff HEAD -- src/index.css` and
  `git diff HEAD -- components.json` are additionally empty, and no scratch file survives.
  If the calendar genuinely needs a token that does not exist, that is a **flagged exception
  escalated to the user**, not a silent commit — and it would also require a `.dark` counterpart
  (I-6) and an `art-direction.md` amendment.
  Successor to **I-18** (`src/index.css` written in Phase 1 of the overhaul only).
- **I-5 / I-7 / I-19 (carried)** — accent stays indigo `oklch(0.52 0.15 265)`; **no Tailwind
  arbitrary values for design decisions** (`h-[var(--…)]` and other `var(--…)` forms are exempt;
  `size-[36px]`, `text-[11px]`, `w-[220px]` are not — pre-existing ones are grandfathered but must
  not multiply); do not raise `:root --radius`. The generated `calendar.tsx` is the single most
  likely source of a token-diff regression in this feature.

### Layering

- **I-39 — Chrome stays dumb.** `AppHeader.tsx` and `AppSidebar.tsx` gain **only** a feature
  component element and its import. No store subscription, no query, no new state, no domain
  logic — the rule is documented in `AppLayout.tsx` and is why `BranchLabel.tsx` exists as a
  component rather than an inline store read.
- **INV-L2 (carried, ESLint-enforced) — `src/components/**` never imports `src/features/**`.**
  The three new shadcn primitives are domain-agnostic and must stay that way.
- **I-22 (carried) — `.tsx` files export components only** (`react-refresh/only-export-components`).
  `branches.ts`, `dateRange.ts`, `filtersPersistence.ts`, `dashboardFiltersStore.ts` and
  `useBranchHydration.ts` are all `.ts`. If the shadcn generator emits a non-component export in a
  generated `.tsx`, move it.

---

## Carried forward — still at risk here

- **I-1 — One failing query never blanks the board.** Every dashboard widget owns its own query,
  loading, error and empty state. **`CmoDashboardPage` has no page-level state and no hoisted
  query.** A zustand store read is *not* a query and *not* page state — but `DateRangeControl`
  must own its own subscription; the page may not hoist one and thread it down, and may not gain a
  `useQuery`. `FinancialBillingWidget`'s two independent queries stay independent.
  *At risk in Phases 4 and 5.*
- **I-15 — Every interactive element keeps a visible focus ring.** The house vocabulary is
  `focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2`. The shadcn
  `radix-nova` `SelectTrigger` ships its own `focus-visible:ring-*`; match the siblings so the
  header does not end up with two focus-ring vocabularies.
- **I-17 — `prefers-reduced-motion` is honoured.** The global backstop at the bottom of
  `src/index.css` must not be edited or overridden with `!important`. New animation — select
  open/close, popover fade/zoom, calendar month transition — must degrade under it. **Verify the
  backstop actually reaches Radix's `animate-in` / `zoom-in-95` classes rather than assuming**; if
  it does not, add `motion-reduce:animate-none` on the component, never in `index.css`.
- **I-14 — Colour is never the only channel.** The selected preset carries a check glyph or
  `aria-current`, not just a tint.
- **I-20 — `noUnusedLocals` means dead code is removed in the same phase that orphans it.**
  `DashboardFilterBar.tsx`, its import and its usage all go in Phase 4. Also the reason the 11
  `.api.ts` edits keep the query scope as a single object rather than destructuring `from`/`to`
  into unused locals.
- **I-21 — No component-render tests.** Vitest is `environment: 'node'` and collects
  `src/**/*.test.ts` only. Logic worth testing lives in a pure module. Adding jsdom is a separate,
  explicit decision — and it is the reason decision D4 chose store-read-inside-hook over explicit
  args: the "more testable" option buys testability this environment cannot cash.
- **I-24 — Grep before deleting.** `DashboardFilterBar`'s sole consumer is `CmoDashboardPage`
  (verified) — but re-verify at delete time rather than trusting this line.
- **I-23 — Everything this feature produces lives in `.claude/artifacts/` (NO leading dot).**
  `decisions.md` is **append-only**: `D-cmo-ui-overhaul-1..7` and `diff.md`, `checkpoint.md`,
  `art-direction.md` are the historical record and stay.
- **I-29 — `.claude/.artifacts/` (DOTTED) is out of scope and stays deleted.** No phase creates,
  restores, reads or writes anything there, and no phase copies structure out of
  `.claude/templates/design/`. Under P0 Option A, that deletion becomes **committed** — the
  checkpoint commit is what makes it permanent rather than perpetually staged.
- **I-30 — `validate-manifest.mjs` is never a gate and its output is never "fixed".** There is no
  manifest, by decision. Creating one to satisfy the script resurrects exactly the confusion the
  user asked to remove.

---

## Implicit invariants this plan risks violating — flagged

| Invariant | Where the plan risks it |
|---|---|
| **I-41** (gates must be able to fail) | **P0 / everywhere.** The tree starts dirty, so as originally written `git diff --stat src/index.css` was permanently non-empty, Phase 5's "exactly 11 modified files" could not run against an untracked directory, and Phase 6's `git diff` on `.claude/artifacts/` would have compared nothing. Caught in DE review round 2. Vacuous gates are more dangerous than missing ones because they read as passes. |
| **I-31b** (two init flags) | Phase 3. The original spec asked one `hydratedFromUser` boolean to answer two questions with contradictory initialisers — caught in DE review round 1. It guards the feature's most likely bug (H-12/R2), and "simplifying" it back to one flag re-introduces the bug **silently**: the switcher still works, it just forgets. |
| **I-32c** (no write-on-init) | Phase 1. `decodeFilters` returning `healed: true` for a `null` raw would persist the default blob for every brand-new user at first module-eval, and re-attempt a doomed write on every load in private mode. The condition is `present && healed`, and `healed` must be `false` when `present` is `false`. |
| **I-35b / I-40** (non-interactive CLI, theme untouched) | Phase 2. `components.json` points the shadcn CLI's `css` target **at `src/index.css`**, and the CLI prompts. Both are silent-failure paths: an unsuppressed prompt hangs the Operator, and an unnoticed CSS write puts an unrecorded token in the theme file. Mitigated structurally, gated by a hash that works regardless of the P0 outcome. |
| **I-31** (single source of truth) | Phase 3. The obvious-looking "keep the user in sync" implementation writes `authStore`. It must not. |
| **I-34** (RQ v5 API) | Phase 5. `keepPreviousData: true` is muscle memory from v4 and fails silently — the board still flashes to skeletons and nothing errors. |
| **I-20** (dead code same phase) | Phase 4's `DashboardFilterBar` deletion, and Phase 5's temptation to destructure `from`/`to`. |
| **I-1** (no hoisted query/state in the page) | Phase 4. Threading `selection` down from `CmoDashboardPage` into the control is the natural-looking React move and is exactly wrong here. |
| **I-37** (pure resolver) | Phase 1. Reaching for `new Date()` inside `resolveRange` makes every quarter/YTD/leap boundary case untestable and re-introduces the tz bug class. |
| **I-7** (no arbitrary values) | Phase 2's generated `calendar.tsx` and Phase 4's `max-w-[calc(100vw-2rem)]` reflex. Use Radix's `--radix-popover-content-available-width` (a `var(--…)` form, token-diff exempt). |
| **I-17** (reduced motion) | Phases 2 and 4. Radix's `animate-in`/`zoom-in-95` are easy to assume the global backstop covers. Verify. |
| **I-35 / I-28** (dependency hygiene) | Phase 2. The CLI may add `@radix-ui/react-select`/`-popover` alongside the unified `radix-ui` that already exports both. |
| **I-29** (pipeline store stays deleted) | **P0.** The checkpoint commit must *include* the staged deletion. Committing everything *except* that deletion would leave it perpetually staged and one `git checkout` away from resurrection. |
| **I-23** (append-only decision log) | Phase 6. `decisions.md` must be appended to, not rewritten. |
