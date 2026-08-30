# State — Zelkora Global Branch Switcher & Working Date Range

Supersedes the CMO UI Overhaul state (Phases 1–6, complete — see `decisions.md`
`D-cmo-ui-overhaul-1..7`, `diff.md`, `checkpoint.md`). This file tracks the **new** feature only.

**Revision:** DE review rounds 1–2 applied — Issue A (two init flags), Issue B (non-interactive
CLI contract), Issue C (no write-on-init for a fresh profile), **Issue D (git baseline + HEAD-scoped
gates)**.

```
Current phase: Phase 3 COMPLETE (2026-08-30) — Phase 4 next. P0 + Phases 1-3 committed (BASELINE_SHA 1dfb27b).
               Operator run "/operator execute phases 3,4" — in progress. 360px header verdict + all
               manual/DevTools checks for Phase 3 deferred to the E2E pass (no interactive browser this run).
Phases:        6
Prior work:    Zelkora CMO Dashboard & UI Overhaul, Phases 1-6, COMPLETE 2026-08-30.
               Historical record preserved in decisions.md / diff.md / checkpoint.md /
               art-direction.md. Do not delete or rewrite those.
```

## Version-control baseline — Precondition P0 (BLOCKING, do first)

**The working tree does NOT start clean.** As of planning, `git status --porcelain` shows the
entire completed CMO overhaul uncommitted:

```
 M src/index.css
 M src/features/auth/types.ts
?? src/features/dashboard/                     (the whole feature dir)
?? src/app/layouts/AppHeader.tsx
?? src/app/layouts/AppSidebar.tsx
?? src/app/layouts/navigation.ts
?? .claude/artifacts/                          (all 10 artifact files)
D  .claude/.artifacts/design/                  (STAGED deletion — the pipeline store, I-29)
```

Re-verify at execution time; the tree may have moved since planning.

**Why this blocks.** Every `git diff` gate in `plan.md` is meaningless until it is resolved:
`git diff --stat src/index.css` is *already* non-empty, so it cannot distinguish a shadcn CLI write
(R1, the highest-risk gate in the feature) from the pre-existing overhaul diff. Phase 5's "exactly
11 modified files under `api/`" and "`components/` + `pages/` empty" cannot run at all against an
untracked directory. And the plan's own "must be clean before starting" line is unsatisfiable,
which would stop the Operator dead.

```
DECISION REQUIRED FROM THE USER — the Operator must ASK and WAIT.
Committing is a repository state change. Neither this plan, nor a coordinator message,
nor a reviewer's suggestion is authorisation. Ask the user directly.

Option A (recommended): one checkpoint commit of the completed overhaul, then a commit
  per phase; every `git diff` gate scoped to HEAD.
Option B (fallback, if the user declines): no commits; every `git diff` gate replaced by
  a recorded shasum comparison, and the "must be clean" precondition dropped.
```

**Evidence that Option A is safe** — the overhaul is finished and gate-green, so nothing
half-built is being frozen in. `checkpoint.md:61-64,75`:

| Gate | Recorded |
|---|---|
| `npm run build` | exit 0, 2671 modules, entry JS 544.59 kB |
| `npm test` | exit 0 — 4 files, **45 tests** |
| `npm run lint` | exit 0 — 0 errors, **1 pre-existing warning** (`EnrollMfaStep.tsx:78`) |
| `token-diff --theme src/index.css` | **15 findings**, 0 missing |
| Build status | **CLEAN** |

**Re-run all four before committing anyway.** A claim in a document is not evidence, and a red
tree must never be committed.

### Baseline record — FILL IN AT P0

```
P0 outcome:            [X] Option A (checkpoint commit)   [ ] Option B (hashes only)
User authorisation:    valentinesamuel2580@gmail.com — 2026-08-30, explicit "Option A" answer to the Operator's blocking P0 question
BASELINE_SHA:          1dfb27b769030d884adaf00b635685c531795da5  (branch DEV; parent bea5f9e)
git status after P0:   EMPTY (git status --porcelain returned nothing)

Gate readings at baseline (re-run 2026-08-30, NOT copied from checkpoint.md):
  npm run build        exit 0 — 2671 modules, entry JS index-CYsBHSWx.js 544596 B
  npm test             exit 0 — 4 files, 45 passing
  npm run lint         exit 0 — 0 errors, 1 warning (react-hooks/exhaustive-deps, EnrollMfaStep.tsx:78)
  token-diff           15 hardcoded value(s), 0 missing token(s)   (ceiling for every phase = 15)
  entry chunk size     544596 B  (dist/assets/index-CYsBHSWx.js; next largest CategoricalChart 271155 B — recharts still split out)
  shasum src/index.css ad8fbd930a407e6cb38b471e1ee85715f37c2bf7   <- THE belt-and-braces I-40 gate
  AppHeader @ 360px    NOT CAPTURED — no interactive browser in this Operator run. Phases 1-2 do
                       not touch AppHeader; this MUST be captured before Phase 3 (H-5 / R6) or
                       F3-d overflow is unattributable. Flagged in Risks/anomalies.

Under Option A the git diff gates are live against BASELINE_SHA; the Option-B hash table below
is left blank by design (not taken).
```

### Per-phase commit log — FILL IN AS PHASES COMPLETE (Option A)

Gates run **before** the commit; `HEAD` is the previous phase's commit at gate time (I-41).
Never amend or rebase a completed phase — the SHAs are what the gates lean on.

| Phase | SHA | build | tests | lint | token-diff | entry chunk | notes |
|---|---|---|---|---|---|---|---|
| P0 baseline | `1dfb27b` | exit 0 | 45 | 0/1 | 15 | 544596 B | overhaul checkpoint + pipeline-store deletion; index.css sha ad8fbd93 |
| 1 Filter foundation | `c2803df` | exit 0 | 89 | 0/1 | 15 | 544596 B | date-fns@4.4.0 exact, no --legacy-peer-deps; index.css sha ad8fbd93 unchanged; +44 tests, 5 new modules unmounted |
| 2 UI primitives | `9e15733` | exit 0 | 89 | 0/1 | 15 | 544596 B | select/popover in-tree; calendar via out-of-tree fallback (button.tsx overwrite prompt); react-day-picker@10.0.1 exact, no --legacy-peer-deps; entry-chunk delta 0 B (rdp unmounted) — Phase 4 must lazy-load calendar; CSS bundle 51.6→61.8 kB |
| 3 BranchSwitcher | `d1e64d4` | exit 0 | 89 | 0/1 | 15 | 616254 B | Radix Select now in the entry chunk (+71,658 B) — global chrome, not lazy-loadable; rdp NOT in entry (calendar still unmounted). index.css sha ad8fbd93 unchanged. 5 files: 3 new `features/branch/`, 2 modified chrome. 360px verdict deferred to E2E |
| 4 DateRangeControl | | | | | | | `DashboardFilterBar` deleted |
| 5 Query keying | | | | | | | exactly 11 files under `api/` |
| 6 Decisions/artifacts | | | | | | | docs only |

## Gate set (every phase boundary)

```
npm run build
npm test
npm run lint                                   (0 err / 1 warn — do not regress)
node .claude/scripts/token-diff.mjs --theme src/index.css
    RUN FROM THE FE DIR WITH THE RELATIVE ARG. An absolute --theme path breaks the
    script's file.endsWith(THEME) exemption and falsely reports ~103 findings.
shasum src/index.css                           -> identical to the P0 hash (I-40, both options)
git diff --stat HEAD -- <path>                 -> Option A only; scoped to THIS phase (I-41)
manual dev checks                              (deferred to a single E2E pass, as in the overhaul)

Excluded gate: validate-manifest.mjs — NOT APPLICABLE, permanently. The 6-stage design
               pipeline is deliberately unused; its dotted store .claude/.artifacts/ is deleted
               by user decision (and, after P0 Option A, that deletion is committed). There is
               no manifest to validate, by design (I-29 / I-30).
```

## Phase dependency map

| Phase | Depends on | Can start when | Notes |
|---|---|---|---|
| **P0 — git baseline** | — | **first, blocking** | Requires the **user's** explicit go-ahead. Determines whether every later `git diff` gate is live (Option A) or replaced by hashes (Option B). |
| **1 — Filter foundation** (`BRANCHES`, pure `dateRange` resolver + tests, `filtersPersistence` + tests, `dashboardFiltersStore`, `date-fns`) | P0 | after P0 | The correctness core. No UI, no query changes. Defines **both** init flags (`persistedOnInit`, `userSeedApplied`) even though only Phase 3 reads them — that is the point (I-31b). `decodeFilters` returns `present` **and** `healed` as separate answers (I-32c). `noUnusedLocals` tolerates unused *exports*, so five unmounted modules compile green. |
| **2 — UI primitives** (`select`, `popover`, `calendar` via shadcn; dependency audit) | P0 | after P0 (parallel with 1) | Independent of 1. Only genuinely new dep is `react-day-picker` — verified that `radix-ui@1.6.7` already exports `Select` and `Popover`. **Must run fully non-interactively** (I-35b) and must not touch `src/index.css` or `components.json` (I-40). |
| **3 — `BranchSwitcher` + sidebar label** | 1, 2 | after both | Visible feature. Consumes both Phase-1 init flags in the one-shot hydration predicate. Store value + labels change; query keys do not yet. |
| **4 — `DateRangeControl`, delete `DashboardFilterBar`, page header restructure** | 1, 2 | after both | Deletion + import removal must be the same phase (I-20). |
| **5 — Key all 11 queries by `(branchId, rangeKey)` + `keepPreviousData`** | 1 (hard); 4 (ordering) | after 4 | Hard-depends only on `useDashboardQueryScope` from Phase 1, but should follow 4 so there is a UI to drive the verification. 11 identical mechanical edits, zero caller churn. Its two strongest gates only exist because of P0. |
| **6 — Record decisions, refresh artifacts** | 3, 4, 5 | after all | Docs only. `decisions.md` is **append-only**. |

**Critical path: P0 → 1 → 4 → 5 → 6.** Phase 2 is parallel slack to Phase 1; Phase 3 is slack
against the 4 → 5 path.

## Assumptions

| # | Assumption | Status | If false |
|---|---|---|---|
| A1 | `radix-ui@^1.6.7` (unified) exports `Select` and `Popover`, so shadcn `select`/`popover` add no dependency | **VERIFIED** — `node_modules/radix-ui/dist/index.d.mts:38` (`Popover`), `:48` (`Select`) | Treat them like `react-day-picker`: pin exact, record the peer-dep path |
| A2 | `react-day-picker` installs against React 19.2 (possibly with `--legacy-peer-deps`) | **VERIFIED (Phase 2)** — `react-day-picker@10.0.1` installed clean, **no `--legacy-peer-deps`** (rdp v10 peer `react >=16.8.0`) | Do **not** hand-roll a calendar. Ship Phase 4 presets-only with "Custom…" disabled and escalate to the user |
| A3 | The shadcn CLI generates `from "radix-ui"` imports for `radix-nova`, matching `tooltip.tsx` | **VERIFIED (Phase 2)** — `select.tsx` + `popover.tsx` both emit `from "radix-ui"`; no `@radix-ui/react-*` added | Rewrite the imports by hand and remove any `@radix-ui/react-*` the CLI added (F2-b) |
| A4 | `noUnusedLocals` does not flag unused *exports*, so Phases 1–2 compile unmounted | Verified in the overhaul (Phase 2 shipped 11 unmounted components) | Wire each module in the phase that creates it; re-phase 1 and 2 |
| A5 | `fixtures.test.ts` imports fixtures only, never hooks, so a hook change cannot break it | **VERIFIED** — read the file, all 6 imports are `*.fixtures` | Phase 5 also touches `fixtures.test.ts` |
| A6 | React Query v5 `placeholderData: keepPreviousData` keeps `isPending === false` across a key change | High confidence (documented v5 behaviour) | Widgets flash to skeletons on every switch; audit each widget's loading predicate |
| A7 | The global `prefers-reduced-motion` backstop in `src/index.css` covers `animate-in` / `zoom-in-95` on Radix content | Unverified (H-9) | Add `motion-reduce:animate-none` on the components — **never** edit `src/index.css` (I-40) |
| A8 | Branch is cosmetic: every fixture returns the same payload for every branch | Stated by the user, resolved | — |
| A9 | The attached ecommerce sample is directional for the pill trigger only; its table / "Edit Dashboard" / kebab are out of scope | Stated by the user | — |
| A10 | `token-diff.mjs` accepts `--theme` and must be given a **relative** path from the FE dir | Verified in the overhaul (R11) | See the gate-set note above |
| A11 | `shadcn@4.19.0`'s `add` supports `-y/--yes`, `-o/--overwrite`, `-c/--cwd`, and goes non-interactive under `CI=1` | **PARTIALLY VERIFIED (Phase 2)** — `select`+`popover` generated fully non-interactively in-tree; `calendar` hit a *"button.tsx already exists — overwrite?"* prompt, `< /dev/null` declined it (button.tsx untouched, fast exit), and the **out-of-tree fallback** produced `calendar.tsx`. The backstop worked as designed. | `< /dev/null` turns any unsuppressed prompt into an immediate EOF failure, routing to the out-of-tree fallback. **Never** drop the backstop and answer interactively (I-35b) |
| **A12** | **The user will authorise the P0 checkpoint commit** | **Unverified — must be asked** | Fallback B: recorded `shasum` comparisons replace every `git diff` gate, the "must be clean" precondition is dropped, and `D-cmo-branch-filter-9` records that no commits were made so a future reader does not hunt for SHAs |
| **A13** | **`.claude/` is tracked, not gitignored** | **LIKELY** — the `.claude/.artifacts/design/` deletion is *staged*, which is only possible for tracked paths; and `.claude/artifacts/` appears as `??` (untracked) rather than being hidden | If `.claude/` is ignored, Phase 6 criterion 4 (`git diff HEAD -- art-direction.md`) is **silently vacuous** — it would pass no matter what changed. Fall back to a `shasum` of `art-direction.md` recorded at P0 |

## Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| **R0** | **The `git diff` gates are vacuous because the tree never had a baseline** — `src/index.css` already modified, `src/features/dashboard/` untracked, `.claude/artifacts/` untracked | **High (executability)** | **P0**, blocking, before Phase 1. Option A (checkpoint commit + per-phase commits, gates scoped to `HEAD`) with Option B (recorded hashes) fully specified as the fallback. Requires the **user's** explicit authorisation — the Operator asks and waits (A12). The `src/index.css` `shasum` gate is recorded regardless, because it works under both options and covers R1 |
| **R1** | **`components.json` sets `"css": "src/index.css"`** — the shadcn CLI's write target is the one file this feature must not touch (I-18 / I-40) | **High** | **Structural, not reactive:** Phase 2 step 2 redirects the CLI's `css` target to `src/__shadcn-scratch.css` for the duration of the run, then restores `components.json` verbatim and deletes the scratch file. Gates: `shasum src/index.css` unchanged from P0 (both options), `git diff HEAD -- src/index.css` and `-- components.json` empty (Option A), scratch file absent. A genuinely required new token is an **escalation to the user** |
| **R2** | **Persisted branch overwritten by `user.branchId` on load** — the store initialises before `authStore.bootstrap()` resolves | **High** | **Two separate fields, per I-31b / D7:** `persistedOnInit` (set once from `decodeFilters().present`, never mutated) gates *whether* to seed; `userSeedApplied` (starts `false`, flipped once by `markUserSeedApplied()`) gates *when*. The original single-flag spec had contradictory initialisers — caught in DE review round 1. Explicit manual test: pick branch #3 → reload → still #3; then clear storage → reload → seeded from `user.branchId` |
| **R3** | **Timezone / DST off-by-one in the date resolver** | **High** | The pure module takes `today` as an injected `YYYY-MM-DD` **string**; all arithmetic via `date-fns` calendar helpers; `toISOString()` banned by grep gate; month/quarter/year/leap boundaries are named test cases |
| R3b | **Write-on-init pollutes a fresh profile's `localStorage`** and re-attempts a doomed write every load in private mode | Med | The init write-back is guarded on **`present && healed`**, and `decodeFilters` returns `healed: false` whenever `present` is `false` (I-32c). Manual test: clear the key, load, touch nothing → the key is **still absent**; change the branch once → it appears |
| R4 | **Store lives under `features/dashboard/` but `branchId` is app-global** — a future non-dashboard page importing from `features/dashboard/…` | Med | Accepted (D1). Migration path is a move to `src/features/filters/` + re-export — a rename, not a redesign. Recorded so it is a decision, not an accident |
| R5 | **`react-day-picker` React-19 peer-dep failure** | Med | Pin exact + `--legacy-peer-deps` + record the path taken (the recharts protocol, `D-cmo-ui-overhaul-3`). Fallback is presets-only + escalate, **not** a hand-rolled calendar |
| R5b | **The shadcn CLI prompts and hangs the Operator**, or `@latest` makes the run irreproducible | **High (executability)** | `CI=1 npx --yes shadcn@4.19.0 add … --yes --cwd . < /dev/null`. Every prompt the command can emit is enumerated in Phase 2 with its required answer; `< /dev/null` converts a hang into a fast failure; out-of-tree generation in `/tmp` is the documented fallback (I-35b) |
| R6 | **Header overflow at 360px** with two controls in the right cell, a fixed `w-60` centre button and `grid-cols-[1fr_auto_1fr]` | Med | Capture the **pre-feature** 360px baseline at P0 (H-5) so the regression is attributable. Fix ladder: `min-w-0`+`truncate` → shortName-only below `sm` → hide the centre search below `sm` (**that last step is a chrome behaviour change: record it and tell the user**) |
| R7 | **`keepPreviousData` written in the v4 form** (`keepPreviousData: true`) — silently does nothing | Med | Grep gate in Phase 5 verification, all 11 files |
| R8 | **Refetch storm on switch** — a `Date` object or an unmemoised value in a query key, or a `setSelection` in a render-triggered effect | Med | I-33 (primitives only in keys), I-36 (exactly one refetch per query per switch), memoised `useDashboardQueryScope`, devtools verification |
| R9 | **`calendar.tsx` ships Tailwind arbitrary values** from the generator → token-diff regression (I-7) | Med | Hard count ≤ 15 at every phase boundary; `var(--…)` forms are exempt, literal px/rem forms are not |
| R10 | **Bundle growth** from `react-day-picker` + `date-fns` | Med | Measure the entry-chunk delta in Phase 2; lazy-load the calendar view in Phase 4 if it lands in the entry chunk (F4-g) |
| R11 | **Popover / select portal clipping** inside `h-14` chrome or the `p-6` page column | Med | `*Primitive.Portal` on both `Content` components (Phase 2 step 6); verify in DevTools that the node is a child of `<body>`, not inline |
| R12 | **`localStorage` throws (private mode) or holds corrupt JSON** → white screen | Med | Every access `try/catch`-wrapped **including `JSON.parse`** (I-32); self-heal ladder + rewrite-on-heal (I-38). Both are named manual tests |
| R13 | **Partial staleness during a switch** — 11 queries resolve at slightly different times under `keepPreviousData` | Low today, **Med with a real backend** | Invisible now (fixtures are identical across branches) and acceptable under I-1 (independent widgets). Recorded in `D-cmo-branch-filter-8`; an `isPlaceholderData` opacity / `aria-busy` treatment is the follow-up if it ever shows |
| R14 | **Chrome gains domain logic** — a store hook slipping into `AppHeader`/`AppSidebar` | Low | I-39; both files gain only an import and an element. `BranchLabel` exists precisely so the sidebar does not subscribe |
| R15 | **The page header restructure regresses the `font-display` h1 / subtitle or the section order** | Low | Diff those two elements character by character; section order below the header is untouched |
| R16 | **Calendar keyboard trap** on the preset-list ⇄ calendar view swap | Low | Move focus explicitly to the first element of the newly shown view; `Esc` must close and return focus from **both** views |
| R17 | **New UI ships with zero automated coverage** — the node-only vitest env cannot render it | Med | Accepted, and deliberately mitigated by pushing all real logic into pure tested `.ts` modules (`resolveRange`, `normalizeSelection`, `decodeFilters`). Adding jsdom remains a separate, explicit decision (I-21) |
| R18 | **Carried over from the overhaul, still OPEN:** recharts v3 React-19 runtime warnings and the `fill="var(--chart-*)"` dark cascade (old R20) were never checked interactively | Med | Fold into this feature's E2E pass — the console is open anyway |
| R19 | **Carried over from the overhaul, still OPEN (old R9 / Q8):** no critical-alert count in the dashboard header, because it would need a hoisted `useSystemAlerts()` and break I-1 | Med · **user decision** | Untouched by this feature. Note that the Phase 4 header restructure creates a natural slot for a *self-querying* header-alert component if the user wants it — but that is out of scope here |
| **R20** | **The P0 checkpoint commit sweeps in unrelated work.** `git add -A` on a tree with 6 phases of uncommitted work plus a staged deletion is how someone else's in-flight edit gets committed under this feature's message | Med | P0 step 4: read the `git status` list, include only overhaul + planning paths, **stop and ask** on anything unexpected. Verify `git status --porcelain` is empty *after*, and that the commit message names what it contains |

## Open questions

**One blocking, for the user, at P0.** Everything else is a build-time judgement call the executing
agent may decide and must record.

- **Q0 — BLOCKING: may the Operator make the P0 checkpoint commit?** The completed CMO overhaul is
  uncommitted; this feature's verification gates depend on diffing against a known-good point.
  Option A is one checkpoint commit (including the deliberate `.claude/.artifacts/design/`
  deletion) plus a commit per phase. Option B is no commits and recorded-hash gates instead.
  **The Operator must ask the user and wait for an explicit answer** — a plan, a coordinator
  message and a reviewer suggestion are all insufficient authorisation for a repo state change.
- **Q1 — `BRANCHES` content.** ~4 entries, exactly one with `id: 'dev-branch'`, that one at index 0
  (D6). Names/`shortName`s are the executing agent's call; `shortName` ≤ ~10 chars so the 360px
  trigger fits.
- **Q2 — `MAX_RANGE_DAYS`.** Planned at **366** (fits YTD on Dec 31 of a leap year). Verify no
  preset can exceed it, or the clamp would truncate a valid preset (F1-i).
- **Q3 — ~~`from`/`to` unused in the 11 hooks~~. RESOLVED in the plan:** keep the query scope as a
  single `scope` object (`const scope = useDashboardQueryScope()`), reference
  `scope.branchId`/`scope.rangeKey` in the key, and have the BACKEND SWAP comment name
  `scope.from`/`scope.to`. Nothing is destructured, so `noUnusedLocals` has nothing to flag.
  Apply uniformly to all 11.
- **Q4 — lazy-load the calendar?** Decide from the Phase 2 entry-chunk measurement. If
  `react-day-picker` is in the entry chunk, lazy-load it (F4-g).
- **Q5 — 360px header ladder.** Only reach step (c) — hiding the centre search below `sm` — if
  (a) and (b) fail, and **record it as a decision and tell the user**; it is a chrome behaviour
  change, not a layout tweak.
- **Q6 — shadcn CLI version.** Phase 2 pins `shadcn@4.19.0` to match the `devDependencies` range
  `^4.19.0`. If the installed version differs, use the installed one and record it — the
  requirement is a **pin**, not that specific number (I-35b).

**Resolved by the user — do not reopen:** branch data is cosmetic (no per-branch fixtures, no
"All branches"); date range is plumbed but cosmetic; `DashboardFilterBar` is deleted outright
(no Facility, no Service line, no Reset); one store, one localStorage key, hand-rolled `try/catch`
persistence; the switcher never mutates the `User` object; preset list and default (Today);
`keepPreviousData` on all 11; artifacts live in `.claude/artifacts/` (no dot);
`validate-manifest.mjs` is never run.

**Resolved in DE review rounds 1–2 — do not reopen:** the init model is **two** fields
(`persistedOnInit` + `userSeedApplied`), not one overloaded `hydratedFromUser`; the shadcn
invocation is version-pinned and fully non-interactive with `< /dev/null` as a hard backstop; the
init write-back fires only on `present && healed`, so a fresh profile persists nothing; and
**every `git diff` gate is scoped to `HEAD` behind the P0 baseline**, with recorded hashes as the
fallback and the `src/index.css` hash checked under both.
