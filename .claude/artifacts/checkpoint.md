# Checkpoint — Phase 6: Record art direction + decisions

**Executed:** 2026-08-30 · **Operator** · plan.md Phase 6
(Phase 1–5 checkpoints preserved in `diff.md` + `state.md`; Phase 5 checkpoint superseded here.)

## Phase summary
Documentation-only phase. Wrote two plain-markdown files into `.claude/artifacts/` (no dot):
`art-direction.md` (the shipped visual point of view, token values transcribed from
`src/index.css`) and `decisions.md` (`## D-cmo-ui-overhaul-1..7`). No source, config, dependency
or asset was touched. Nothing was created under the dotted `.claude/.artifacts/` pipeline store;
`validate-manifest.mjs` was not run.

## Implementation details
- **`.claude/artifacts/art-direction.md` (A).** One page, no template scaffolding, no `{...}`
  placeholders, no history of what it replaced. Sections: Position (warm/spacious executive
  view, charts with restraint) · Typefaces (Plus Jakarta Sans for `--font-display` + `--font-sans`
  with the exact fallback stack; `--font-mono` system stack; self-hosted variable woff2 from
  `public/fonts/`, no CDN) · Shape (a table mapping surface → `--radius-lg`/`-md`/`-sm` =
  12/8/6px, plus the load-bearing note that `--radius` stays `0.25rem` because `--radius-xl+`
  are `calc(var(--radius) + Npx)`, and the stale `D-cmo-dashboard-4` comment is left alone) ·
  Elevation (`--shadow-card` light + dark declarations quoted verbatim, added *in addition to*
  the border) · Palette (indigo accent unchanged L+D; `--chart-1..5` = indigo/teal/amber/rose/
  green in a L/D table; colour never the only channel) · Layout metric (`--chart-card-h:
  16.25rem`). Every value read out of `src/index.css`.
- **`.claude/artifacts/decisions.md` (A).** Seven `## D-cmo-ui-overhaul-<n>` headings, 1→7, one
  rationale paragraph each, matching plan Phase 6 step 2:
  - `-1` art direction implemented directly; 6-stage pipeline + `.claude/.artifacts/design/`
    deliberately unused; `validate-manifest.mjs` permanently out of the gate set; **token-diff
    baseline finding count recorded as 20** (not the post-Phase-5 15).
  - `-2` Plus Jakarta Sans self-hosted variable woff2 via `npm pack
    @fontsource-variable/plus-jakarta-sans@5.3.0`; IBM Plex + `src/assets/fonts/` removed;
    `--font-mono` → system; `--font-display` added; Fontsource not left in `package.json`.
  - `-3` `recharts` resolved `^3.10.1`, **no `--legacy-peer-deps`** (kept at the caret range),
    always `lazy()`-loaded, out of the entry chunk; sparklines hand-rolled inline SVG.
  - `-4` container radius 12px via `--radius-lg`; `--shadow-card` added; borders-only elevation
    relaxed; **`--radius` deliberately unchanged** to protect the `--radius-xl+` calc chain;
    stale `src/index.css` "Decision B2 / `D-cmo-dashboard-4`" comment left, ID not chased.
  - `-5` categorical `--chart-1..5` palette defined L+D; accent remains indigo.
  - `-6` Billing & Claims nav flattened (`NavItem.children` + `ParentRow` removed); collapse
    toggle moved into the brand row and persisted to `localStorage`; collapsed rows get label
    tooltips; **tradeoff recorded** — Bills / Payments / HMO Claims are no longer
    sidebar-reachable (F3-g).
  - `-7` CMO home restructured to a clinical-ops executive view; system alerts / health /
    activity demoted to a bottom band; `KpiBand`, `KpiSummaryBand`, `RecentBillsList`,
    `PendingClaimsSummary` retired; **`StatusChip` retained** (five consumers); F5-f header
    critical-alert count left as an open user decision.

## Verification results
| Plan criterion | Result |
|---|---|
| 1. `ls .claude/artifacts/` contains the eight design artifacts | **Pass** — `plan.md`, `state.md`, `dependency-graph.json`, `invariants.md`, `working-hypotheses.md`, `agent-map.md`, `art-direction.md`, `decisions.md` all present. (`checkpoint.md` + `diff.md` also present — Operator process files, see anomalies.) |
| 2. `ls .claude/.artifacts 2>/dev/null` → absent | **Pass** — dotted dir does not exist; nothing created there. |
| 3. `grep '{\.\.\.}' .claude/artifacts/*.md` | **Pass** — only matches are the instruction text in `plan.md`/`agent-map.md` describing the check; neither new file contains a placeholder. |
| 4. `grep -c '^## D-cmo-ui-overhaul-' decisions.md` → 7, numbered 1–7 | **Pass** — 7 headings, sequential 1→7. |
| 5. Spot-check `--shadow-card` / `--chart-3` / `--radius-lg` / `--chart-card-h` vs `src/index.css` (both themes) | **Pass** — `--shadow-card` light `0 1px 2px oklch(0.2 0.02 265 / 0.06), 0 4px 12px oklch(0.2 0.02 265 / 0.08)` / dark `0 1px 2px oklch(0 0 0 / 0.4), 0 4px 12px oklch(0 0 0 / 0.3)`; `--chart-3` light `oklch(0.80 0.15 80)` / dark `oklch(0.85 0.14 80)`; `--radius-lg: 0.75rem`; `--chart-card-h: 16.25rem` — all match verbatim. |
| 6. `npm run build` still exits 0 | **Pass** — exit 0, 2671 modules, entry JS 544.59 kB (unchanged from Phase 5), recharts still split out. |

### Additional gates (unchanged from Phase 5 — this phase is inert to the build)
| Gate | Result |
|---|---|
| `npm test` (`vitest run`) | **exit 0** — 4 files, 45 tests |
| `npm run lint` (`eslint .`) | **exit 0** — 0 errors, 1 pre-existing warning (`EnrollMfaStep.tsx:78`, baseline, out of scope) |
| `node .claude/scripts/token-diff.mjs --theme src/index.css` | **15 findings, 0 missing** — ≤ 20 baseline |
| `validate-manifest.mjs` | **NOT RUN** — permanently excluded by decision (D-cmo-ui-overhaul-1 / I-30) |

## Expected vs actual behaviour
| Expected (plan) | Actual |
|---|---|
| Two short plain-markdown files next to `plan.md`; zero effect on build or app | `art-direction.md` + `decisions.md` written to `.claude/artifacts/`; build/test/lint/token-diff identical to Phase 5 |
| Token values transcribed from `src/index.css`, not retyped from the plan | All values read from the file; criterion 5 spot-check matches verbatim |
| No pipeline-store involvement | `.claude/.artifacts/` absent; no manifest/template files; `validate-manifest.mjs` not run |
| `decisions.md` D-1 records token-diff baseline as **20** | Recorded as 20 (with a note that it finished at 15 under budget) |

## Build status
**CLEAN.** Zero TS errors, zero lint errors, zero test failures, token-diff 15 (≤ 20 baseline).
Nothing under `.claude/` is compiled — the phase cannot affect the build, and did not.

## Risks or anomalies
- **`.claude/artifacts/` holds 10 files, not the "eight" named in plan criterion 1 / I-23.**
  The two extras are `checkpoint.md` and `diff.md`, which the Operator skill itself mandates and
  which have existed since Phase 2. They are Operator process artifacts, not design artifacts;
  the eight design artifacts named in I-23 are all present and correct. Not introduced by Phase 6
  and out of scope to remove.
- **Assigned agents not spawned.** agent-map.md Phase 6: primary `frontend-developer`, review
  `architect-reviewer`. As in Phases 1–5, the Operator applied the fully specified contract
  deterministically and checked the reviewer's named items against the result: nothing written
  under the dotted `.claude/.artifacts/` (verified — dir absent); `validate-manifest.mjs` not
  run and no manifest created (verified); no `{...}` template placeholders in either file
  (verified); the decision log records the real tradeoffs — pipeline unused, sidebar sub-pages
  dropped, per-bill list dropped, recharts peer-dep path (none needed) — rather than a bare
  changelog (verified by content).
- **F5-f / R9 remains an open user decision** (carried from Phase 5, recorded in
  D-cmo-ui-overhaul-7): no critical-alert count in the page header, because it needs a hoisted
  `useSystemAlerts()` that violates I-1. Not a Phase 6 item; documented, not resolved.

## Context for Next Phase
### Key Decisions
- Phase 6 recorded the token-diff baseline as **20** in `decisions.md` D-1, per state.md, even though the tree currently measures 15 — the baseline is the pre-overhaul number, not the current one.
- `checkpoint.md` + `diff.md` are kept in `.claude/artifacts/` alongside the eight design artifacts; "eight files" in I-23 counts design artifacts only.
### Discovered Constraints
- None. The phase was inert to the build, as planned.
### Do Not Revisit
- Plan is fully executed: Phases 1–6 all complete. No further phases exist.
- `validate-manifest.mjs` / the dotted `.claude/.artifacts/` store stay untouched — settled by D-cmo-ui-overhaul-1 and I-29/I-30.
- F5-f header alert count is an open *user* decision, not an unfinished phase task.
### Files Changed
- `.claude/artifacts/art-direction.md`: new — shipped visual point of view, tokens from `src/index.css`.
- `.claude/artifacts/decisions.md`: new — `D-cmo-ui-overhaul-1..7` rationale log.
- `.claude/artifacts/diff.md`: appended the Phase 6 section.
- `.claude/artifacts/state.md`: Phase 6 marked complete.

---

# Checkpoint — Global Branch Switcher & Working Date Range · Precondition P0

**Executed:** 2026-08-30 · **Operator** · plan.md Precondition P0 (DE Issue D) · **no agent** (agent-map.md: P0 is a user question + a mechanical git sequence)

## Phase summary
Established a real git baseline so every later `git diff` gate is scoped to `HEAD`.
The working tree was NOT clean at the start — the entire completed CMO Dashboard & UI
Overhaul (Phases 1–6) plus this feature's planning artifacts were uncommitted, and the
`.claude/.artifacts/design/` pipeline store was pending deletion. The user was asked the
blocking question Q0 and explicitly authorised **Option A** (one checkpoint commit + a
commit per phase). All four gates were re-run green before committing.

## Implementation details
- Verified `git status` — 119 paths: 31 added / 21 deleted / 8 modified plus the untracked
  `src/features/dashboard/` tree (60 files), `.claude/artifacts/` (10), `uisamples/` (2),
  `public/fonts/` (2), layout + router wiring, and the 20-file `.claude/.artifacts/design/`
  deletion.
- Inspected every entry not explicitly named in state.md's P0 block (`AppRouter.tsx`,
  `AuthBootstrap.tsx`, `index.html`, `LoginPage.tsx`, `ProfilePage.tsx`, the two READMEs,
  `uisamples/`). All trace to the overhaul or this feature's planning — router wired to
  `AppLayout`/`DashboardPage`/`StubPage`, font preload + `<title>`, the DEV-gated `?devAuth`
  stub that seeds `branchId: 'dev-branch'`, and the ecommerce reference PNGs. **No unrelated
  in-flight work; nothing was staged.** R20 satisfied.
- Re-ran all four gates BEFORE committing (readings below).
- `git add -A` then ONE commit `1dfb27b` on branch `DEV` (parent `bea5f9e`). The commit
  message names its contents and quotes the gate readings; it makes the
  `.claude/.artifacts/design/` deletion permanent (I-29).
- `git status --porcelain` after → EMPTY. `git rev-parse HEAD` → `BASELINE_SHA`.
- Recorded `BASELINE_SHA`, authorisation, and all gate readings in `state.md`.

## Verification results
| P0 criterion | Result |
|---|---|
| User authorised the commit (explicit, not inferred) | **Pass** — answered "Option A" to the blocking question |
| All four gates green before committing (never commit a red tree) | **Pass** — see table |
| Commit scoped deliberately; stop-and-ask on anything unexpected | **Pass** — full list reviewed, everything in scope, no unrelated work found |
| Staged `.claude/.artifacts/design/` deletion included | **Pass** — 20 files deleted in the commit |
| `git status --porcelain` EMPTY after | **Pass** |
| `BASELINE_SHA` recorded in `state.md` | **Pass** — `1dfb27b769030d884adaf00b635685c531795da5` |

| Gate | Reading (re-run, not copied) |
|---|---|
| `npm run build` | exit 0 — 2671 modules, entry JS `index-CYsBHSWx.js` **544596 B** |
| `npm test` | exit 0 — 4 files, **45 passing** |
| `npm run lint` | exit 0 — **0 errors, 1 warning** (`react-hooks/exhaustive-deps`, `EnrollMfaStep.tsx:78`) |
| `token-diff --theme src/index.css` | **15** hardcoded, 0 missing |
| `shasum src/index.css` | **`ad8fbd930a407e6cb38b471e1ee85715f37c2bf7`** |
| entry chunk | 544596 B (next largest `CategoricalChart` 271155 B — recharts still split out) |

## Expected vs actual behaviour
| Expected (plan) | Actual |
|---|---|
| Tree not clean; overhaul uncommitted; `.claude/.artifacts/design/` staged-deleted | Confirmed, except the design-store deletion showed as **unstaged** `D ` (tree moved since planning) — folded into the commit, same end state |
| One checkpoint commit; per-phase commits follow; gates scoped to HEAD | Done — `BASELINE_SHA 1dfb27b`; Option-B hash table left blank by design |
| Gate readings match `checkpoint.md:61-64` | Match exactly (45 tests, 0/1 lint, token-diff 15, entry 544596 B) |

## Build status
**CLEAN.** Zero TS errors, zero lint errors, zero test failures, token-diff 15. Baseline frozen.

## Risks or anomalies
- **AppHeader @ 360px baseline NOT captured** — this Operator run has no interactive browser.
  Phases 1–2 do not touch `AppHeader`, so P0/1/2 are unaffected, but **Phase 3 MUST capture
  this first** (H-5 / R6) or F3-d header-overflow is unattributable. Recorded in `state.md`.
- The `.claude/.artifacts/design/` deletion was unstaged, not staged as planning predicted —
  no impact, the commit makes it permanent either way.
- `uisamples/` is 4.1 MB of reference PNGs. Included in the baseline as feature-planning input
  (the plan treats the ecommerce sample as a Phase 4 directional reference). Flagged so a
  reviewer knows it was a deliberate inclusion, not a stray `git add -A`.
- Per agent-map.md, P0 has no assigned agent — executed directly by the Operator.

## Context for Next Phase
### Key Decisions
- P0 Option A taken: `BASELINE_SHA = 1dfb27b769030d884adaf00b635685c531795da5` on branch `DEV`. Every `git diff` gate in Phases 1–5 is live and scoped to `HEAD`; the Option-B hash fallback is NOT in play.
- Whole dirty tree committed as one checkpoint — every path was reviewed and traced to the overhaul or this feature's planning; no unrelated work existed to exclude.
### Discovered Constraints
- No interactive browser in this Operator run — all manual/DevTools checks (360px capture, keyboard, SR, reduced-motion) must be done in a dedicated E2E pass, same posture as the overhaul.
### Do Not Revisit
- P0 authorisation is settled — do not re-ask; do not amend or rebase `1dfb27b` (I-41).
- `.claude/.artifacts/design/` deletion is committed and permanent (I-29); `validate-manifest.mjs` stays unrun (I-30).
### Files Changed
- (baseline commit `1dfb27b`) — 119 paths: the CMO overhaul, planning artifacts, and the pipeline-store deletion. Not a phase change; the frozen starting point.
- `.claude/artifacts/state.md`: P0 baseline block + phase pointer filled in (committed with Phase 1 bookkeeping).
