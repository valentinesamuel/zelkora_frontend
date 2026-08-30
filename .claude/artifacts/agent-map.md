# Agent Map — Global Branch Switcher & Working Date Range

Agents are selected **only** from the installed pool at
`/Users/valentinesamuel/Desktop/deyon/zelkora/zelkora_frontend/.claude/agents/`:
`accessibility-tester`, `architect-reviewer`, `code-reviewer`, `compliance-auditor`, `debugger`,
`frontend-developer`, `fullstack-developer`, `javascript-pro`, `performance-engineer`,
`qa-expert`, `react-specialist`, `typescript-pro`, `ui-designer`.

**Revision:** DE review rounds 1–2 applied — reviewer bullets updated for the two-flag init model,
the non-interactive CLI contract, the `present && healed` write condition, and **the P0 baseline /
`HEAD`-scoped `git diff` gates**.

**On reference skills.** The skill names in the Oracle brief (`api-design-patterns`,
`authentication-patterns`, `database-optimization`, `microservices-design`,
`monitoring-observability`, `performance-optimization`, `postgres-optimization`, `redis-patterns`,
`security-hardening`, `websocket-realtime`, `vercel-react-best-practices`) are **not installed in
this project** — `.claude/skills/` contains only the six design-pipeline skills plus `_shared/`,
and **the design pipeline is deliberately unused** (I-29 / I-30). None of them is invoked.
Reference material below points only at what exists and is in scope:
`.claude/knowledge/craft.md`, `.claude/knowledge/stack.md`, `.claude/artifacts/art-direction.md`,
`.claude/artifacts/decisions.md`, `.claude/artifacts/checkpoint.md`, and the attached ecommerce
sample (directional, pill trigger only).

---

## P0 — Version-control baseline: **no agent**

P0 is not an engineering task. It is (a) a question for the **user** — may the Operator make a
checkpoint commit — and (b) a mechanical `git` sequence once answered. Assigning a reviewer would
imply someone other than the user can authorise a repository state change, which is exactly what
I-41 forbids.

**The Operator executes P0 directly, and must:** ask the user and wait; re-run all four gates
before committing (never commit a red tree); scope the commit deliberately and stop-and-ask on
anything unexpected in `git status` (R20); include the staged `.claude/.artifacts/design/`
deletion (I-29); and record `BASELINE_SHA` — or, if consent is withheld, the fallback-B hash table
— in `state.md`.

**Every reviewer below inherits one duty from P0:** if a gate they are asked to confirm turns out
to be vacuous (a `git diff` that cannot fail, a hash that was never recorded), **say so** rather
than marking it passed. I-41 exists because a gate that reads as a pass while being unable to fail
is worse than no gate at all.

---

## Not assigned to any phase, and why

| Agent | Why not |
|---|---|
| `fullstack-developer` | There is no backend. The data layer is 11 fixture modules; the "API" work in Phase 5 is a comment update and a query key. Nothing spans a stack. |
| `compliance-auditor` | No PHI, no auth surface, no regulatory boundary is touched. Branch selection is explicitly **cosmetic** — the same fixture is returned for every branch — so there is no data-segregation claim to audit. Assigning it would manufacture false assurance about a control that does not exist. |
| `debugger` | Reactive by nature. Call it if a phase fails its gates; do not schedule it. |
| `javascript-pro` | The codebase is TS-strict end to end; `typescript-pro` covers the same ground with the type system in hand. Two generalist language agents on one feature is redundant coverage. |
| `code-reviewer` | Generalist. Every phase below has a reviewer chosen for the specific axis that phase can fail on, which is strictly more useful. |
| `frontend-developer` | Used only in Phase 2 and 6 (see below). Phases 3–4 are React-composition and state problems, where `react-specialist` is the sharper instrument. |
| `ui-designer` | Used only in Phase 4. Phases 1, 2, 5 render nothing new that requires visual judgement, and Phase 3's switcher inherits the header's existing vocabulary rather than establishing anything. |
| `architect-reviewer` | Used only in Phase 6, on the decision record. |
| `qa-expert` | Used only in Phase 1, where there is a real test matrix to design. Elsewhere there is no test infrastructure to build — vitest is node-only, no e2e harness exists (I-21), and per-phase manual verification is already specified. |

---

## Phase 1: Filter foundation — BRANCHES, pure date resolver, persistence serde, store

**Primary:** `typescript-pro` — the phase is interface design plus a pure, exhaustively-typed
resolver under strict TS with `noUnusedLocals`. `PresetKey` as a `const`-derived union,
`normalizeSelection(raw: unknown)` narrowing arbitrary parsed JSON into a valid `RangeSelection`,
the discriminated `preset === 'custom'` shape, and the `DecodedFilters` contract that keeps
`present` and `healed` as **two separate booleans** are type-system problems before they are date
problems.

**Review:** `qa-expert` — this is the one phase in the feature with a genuine test matrix, and the
matrix *is* the deliverable. Boundary-case completeness is a testing-discipline judgement, not a
typing one.

**Reference:** `.claude/knowledge/stack.md`.

**Reviewer must specifically confirm:**
- `dateRange.ts` contains **no** `new Date()`, `Date.now()`, `localStorage` or React import, and
  `today` is a **parameter** on every exported function (I-37) — grep, do not skim;
- `grep -rn "toISOString" src/features/dashboard/filters src/features/branch` returns nothing
  (F1-a);
- named test cases exist for **all** of: each of the six presets; `startOfQuarter` on the first
  **and** last day of a quarter; YTD on Jan 1 **and** Dec 31; `last7`/`last30`/`last90` crossing a
  month boundary **and** a year boundary; a leap-February span; custom reversed → swapped; custom
  future → clamped; custom oversized → clamped to `MAX_RANGE_DAYS`; garbage → `today`;
  `decodeFilters` on `null` / `''` / `'not json'` / `'[]'` / unknown `v` / unknown `branchId`;
  and **`normalizeSelection` idempotency** (`n(n(x)) === n(x)`);
- the "last N days" presets are documented as **inclusive of today** (`N − 1` offset), so nobody
  silently changes the semantics later;
- `MAX_RANGE_DAYS = 366` cannot truncate a legitimate preset (YTD on Dec 31 of a leap year is
  exactly 366) — F1-i;
- **the store defines BOTH `persistedOnInit` and `userSeedApplied` as distinct fields**, neither
  persisted into the JSON blob; `persistedOnInit` is assigned once from `decodeFilters().present`
  and has **no setter**; `markUserSeedApplied()` touches only `userSeedApplied` and writes nothing
  to storage. **`grep -rn "hydratedFromUser" src/` must return nothing** (I-31b / F1-j / D7).
  *Phase 3 consumes these, but they are specified and reviewed here — that is the whole point of
  defining them in the phase that owns the store;*
- **`decodeFilters(null, today)` returns `{ present: false, healed: false }`**, and
  `filtersPersistence.test.ts` asserts exactly that — not "returns the default blob to be written"
  (I-32c / DE Issue C);
- **the store's init write-back is guarded on `decoded.present && decoded.healed`** — a genuinely
  bad stored value is corrected in storage, and a **fresh profile writes nothing at all**. Both
  halves matter and they pull in opposite directions (F1-e);
- persistence is **hand-rolled `try/catch`**, not `zustand/middleware/persist`; the `JSON.parse`
  is **inside** the guard (F1-d); setter writes happen in the setter, **not** in a `useEffect`
  (F1-g); the read happens at module-eval time;
- `dashboardFiltersStore.ts` does **not** import `authStore`;
- all five new modules are `.ts`, not `.tsx` (I-22);
- **`shasum src/index.css` matches the P0-recorded hash** — a logic-only phase must not have
  touched the theme (I-40).

---

## Phase 2: UI primitives — shadcn `select`, `popover`, `calendar` + dependency audit

**Primary:** `frontend-developer` — running a code generator under a strict non-interactive
contract, auditing the resulting dependency and CSS diff, and normalising generated files to house
style is build-level frontend plumbing, not React composition. Nothing is wired in.

**Review:** `performance-engineer` — the two things this phase can silently get wrong are both
weight: a duplicated Radix runtime, and `react-day-picker` landing in the entry chunk. Bundle
discipline was this reviewer's assignment in the overhaul's Phase 2 for the same reason
(recharts), and the muscle transfers directly.

**Reference:** `.claude/knowledge/stack.md`, `.claude/artifacts/decisions.md`
(`D-cmo-ui-overhaul-3` — the recharts peer-dep protocol to mirror).

**Reviewer must specifically confirm:**
- **the CLI was invoked non-interactively and reproducibly** (I-35b / R5b): a **pinned** version
  (not `@latest`), `CI=1`, `npx --yes`, `--yes`, `--cwd .`, and **`< /dev/null`** present. Confirm
  from the recorded command, not from the file output — a run that hung and was completed by hand
  produces the same files and is not reproducible. **`--overwrite` must be absent** (F2-g);
- if the command failed on EOF, the **out-of-tree fallback** was used (generate in `/tmp`, copy the
  three `.tsx` files in, install `react-day-picker` by hand) rather than the backstop being dropped;
- **`shasum src/index.css` is identical to the P0-recorded hash** (I-40 / R1) — this is the gate
  that holds regardless of which P0 option was taken. Confirm the *structural* mitigation was used
  (`components.json`'s `css` redirected to a scratch file for the run), not an after-the-fact
  revert. Under Option A, also `git diff HEAD -- src/index.css` empty;
- **`git diff HEAD -- components.json` is empty** (Option A) or its hash is unchanged (Option B),
  and **`src/__shadcn-scratch.css` does not exist** (F2-c2). Under Option A this must be checked
  *before* the phase commit — a committed scratch file is permanent;
- `grep -n "@radix-ui/react-" package.json` returns **nothing** — the unified `radix-ui@1.6.7`
  already exports `Select` and `Popover` (VERIFIED, H-1), and shipping both duplicates Radix and
  can create two context instances (F2-b / I-35);
- `select.tsx` and `popover.tsx` import `from "radix-ui"`, matching `src/components/ui/tooltip.tsx:2`;
- `react-day-picker` is pinned to an **exact** version (no caret), `date-fns` was not re-caretted
  by the CLI, and **whether `--legacy-peer-deps` was needed is recorded** (I-35);
- both `Content` components are wrapped in `*Primitive.Portal` (F3-f / F4-f / R11);
- `react-day-picker/style.css` is imported **nowhere** in `src/`;
- token-diff count is still **≤ 15** — `calendar.tsx` is the likeliest generator of a literal
  arbitrary value (I-7 / H-11); `var(--…)` forms are exempt;
- `npm run lint` is clean — no non-component export survives in a generated `.tsx` (I-22);
- `git status --porcelain src/components/ui/` shows exactly **three added** files and **no
  modified** file (F2-g). *This gate is valid under both P0 options — those files were already
  committed;*
- the entry-chunk delta vs. the P0 baseline is measured and recorded in `state.md`, with an
  explicit recommendation on whether Phase 4 must lazy-load the calendar (F4-g / Q4).

---

## Phase 3: `BranchSwitcher` in `AppHeader` + branch name in the sidebar footer

**Primary:** `react-specialist` — the load-bearing problem is a state/lifecycle race: a store that
initialises at module-eval time meeting an `authStore` that resolves asynchronously, with a
one-shot hydration effect that must not clobber a persisted choice. That is a React state-ownership
problem, not a styling one.

**Review:** `accessibility-tester` — this phase puts a new interactive control into the **global
app chrome**, where an a11y defect is on every screen. Keyboard traversal, listbox semantics,
focus-ring vocabulary and the 360px reflow are this reviewer's core competence, and none of them
is verifiable by the build.

**Reference:** `.claude/knowledge/craft.md`, `.claude/artifacts/art-direction.md`.

**Reviewer must specifically confirm:**
- **the two-field hydration predicate is implemented exactly as specified** (I-31b / D7 / F3-a) —
  this is the highest-risk behaviour in the feature:
  ```
  if (!userSeedApplied && user !== null) {
    markUserSeedApplied();                 // unconditional — the one-shot has been "considered"
    if (!persistedOnInit) { setBranchId(...); }
  }
  ```
  Specifically: `persistedOnInit` is **read from the store's init snapshot, never re-derived from
  current state**; `markUserSeedApplied()` is called **outside** the inner `if` (F3-j — calling it
  inside makes the effect re-evaluate all session for a returning user); and
  **`grep -rn "hydratedFromUser" src/` returns nothing**;
- **behavioural proof of both paths, not just code reading:**
  *returning user* — pick branch #3 → reload → **still #3**;
  *first-time user* — clear `zelkora.dashboard.filters` → reload → seeded from `user.branchId`;
- **fresh-profile storage (I-32c / R3b)** — clear the key, load the app, **touch nothing** → the
  key is **still absent** in DevTools → Application → Local Storage. Change the branch once → it
  appears. A key that materialises without user action means the `present && healed` guard was
  dropped;
- `grep -rn "authStore\|useAuthStore" src/features/branch/` matches **only** `useBranchHydration.ts`
  and only as a **read** — the switcher never writes the `User` object (I-31 / F3-b);
- **`git diff --stat HEAD -- src/app/layouts/AppHeader.tsx`** is small (≈ +4/−1) and confined to
  the right cell, and `grep -n "useDashboardFiltersStore\|useQuery\|useState" src/app/layouts/AppHeader.tsx`
  returns nothing (I-39 / F3-e). *Under fallback B:* the recorded `AppHeader.tsx` hash changed and
  the change is only the wrapper + element + import, confirmed by reading;
- `grep -n "user.branchId" src/app/layouts/AppSidebar.tsx` returns nothing, and an unknown branch
  id renders **nothing** rather than the raw id (I-38 / F3-h);
- the trigger carries the **house** focus ring
  (`focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2`), not
  shadcn's default `focus-visible:ring-*` — the header must not end up with two focus-ring
  vocabularies (I-15 / F3-g);
- full keyboard path: Tab to trigger (visible ring) → `Enter`/`Space`/`↓` opens → `↑`/`↓` moves →
  first-letter typeahead works → `Enter` selects → `Esc` closes **and returns focus to the
  trigger**;
- a screen reader announces the control's name (`aria-label="Switch branch"`) **and** the selected
  option;
- responsive label: `shortName` at 360px, full `name` at ≥ 640px, implemented with CSS
  (`sm:hidden` / `hidden sm:inline`), **not** `matchMedia` or a resize listener;
- **360px header**: compare against the **P0** capture before attributing any overflow to the
  switcher (H-5 / R6). If step (c) of the fix ladder was used — hiding the centre search below
  `sm` — confirm it was **recorded as a decision and surfaced to the user**, not slipped in;
- `SelectContent` is portalled to `<body>` (inspect the DOM), light **and** dark mode both legible,
  and `prefers-reduced-motion: reduce` suppresses the open/close animation (I-17);
- storage resilience: a corrupted `zelkora.dashboard.filters` value and a `not json` value both
  render the app and self-heal (**and the corrected value is written back**); private-mode storage
  (blocked) does not white-screen (I-32 / I-38 / R12);
- `shasum src/index.css` unchanged from P0 (I-40).

---

## Phase 4: `DateRangeControl`, delete `DashboardFilterBar`, restructure the page header

**Primary:** `react-specialist` — a two-view popover (presets ⇄ calendar) with explicit focus
management across the view swap, a lazy-loaded calendar behind `Suspense`, and a page-header
restructure that must not hoist state into `CmoDashboardPage` (I-1). All composition and lifecycle.

**Review:** `accessibility-tester` — a date-range calendar is the single hardest a11y surface in
this feature: grid semantics, arrow/PageUp-PageDown navigation, range-selection announcement, the
focus trap risk on the view swap, and reduced-motion on two layered animations. None of it is
caught by a build.

**Second review:** `ui-designer` — genuinely orthogonal axis. Someone has to judge whether the
bordered pill reads as the clean, muted control the ecommerce sample points at, whether the
restructured header still reads as an executive page header, and whether removing the filter bar
left the top of the page balanced or hollow. That is craft judgement, not correctness. This is the
**only** phase with two reviewers.

**Reference:** the attached ecommerce sample (**pill trigger only** — its "Facility Snapshot"
table, "Edit Dashboard" button and kebab menu are out of scope),
`.claude/artifacts/art-direction.md`, `.claude/knowledge/craft.md`.

**Reviewers must specifically confirm:**
- **`grep -rn DashboardFilterBar src/` returns nothing**, and the file, its import
  (`CmoDashboardPage.tsx:7`) and its usage (line 116) all went in **this** phase (I-20 / I-24 /
  F4-a). Under Option A, `git status --porcelain` shows the file as deleted (`D`) before the
  phase commit;
- the `<h1>` (`font-display text-2xl font-semibold tracking-tight`, "Operations Overview") and the
  subtitle `<p>` are **character-identical** apart from indentation, and the section order below
  the header is untouched (F4-b / R15). Read this from
  `git diff HEAD -- src/features/dashboard/pages/CmoDashboardPage.tsx`; under fallback B, compare
  against the values quoted in the phase's rehydration context;
- `grep -n "useQuery\|useState\|useReducer" src/features/dashboard/pages/CmoDashboardPage.tsx`
  returns nothing — the control owns its own store subscription; nothing was hoisted and threaded
  down (I-1 / F4-c);
- the trigger label is computed from `resolveRange(selection, today)` **on every render**, not
  cached at selection time — otherwise "Today" shows yesterday's date after midnight (F4-j);
- `grep -rn "toISOString" src/features/dashboard/filters/` returns nothing — the calendar emits
  `format(d,'yyyy-MM-dd')` (F1-a);
- future dates are **not selectable** (`disabled={{ after: today }}`) **and** `normalizeSelection`
  still runs in the setter — both defences present, neither removed (F4-e);
- keyboard: Tab to pill → `Enter` opens → `↑`/`↓` through presets → `Enter` selects and closes with
  focus returned; into "Custom…" → arrows move by day, `PageUp`/`PageDown` by month, `Enter`
  selects both bounds; **`Esc` closes and returns focus from *both* views**; focus is explicitly
  moved on the preset ⇄ calendar swap and nothing is stranded on an unmounted node (F4-h / R16);
- a screen reader announces the trigger name, the selected preset, and the resolved range after a
  custom selection — including an `aria-live="polite"` echo from the control itself (F4-l);
- the selected preset is marked by a glyph or `aria-current`, not tint alone (I-14);
- `PopoverContent` is portalled to `<body>` and never overflows the viewport; **two** months at
  ≥ 640px, **one** at 360px; containment uses `--radix-popover-content-available-width` rather
  than a literal `max-w-[calc(100vw-2rem)]` (I-7 / F4-d);
- token-diff count ≤ **15**; `shasum src/index.css` unchanged from P0 (I-7 / I-40 / F4-k);
- `prefers-reduced-motion: reduce` suppresses **both** the popover fade/zoom and the calendar month
  transition — verified in DevTools, not assumed from the global backstop (I-17 / H-9 / F4-i);
- if the Phase-2 measurement said so, the calendar is behind `lazy()` + `Suspense` with a fallback
  **sized to the loaded height** so the popover does not resize under the cursor (F4-g);
- light **and** dark: pill border, muted label, and the calendar's selected / range-middle /
  disabled day states are all legible.

---

## Phase 5: Key all 11 dashboard queries by `(branchId, rangeKey)` + `keepPreviousData`

**Primary:** `react-specialist` — the risk is entirely React Query v5 semantics: the v4→v5
`keepPreviousData` rename, `isPending` vs `isFetching` in eleven widget consumers, and preserving
per-widget query ownership (I-1) across a wide mechanical edit. The typing is trivial; the cache
behaviour is not.

**Review:** `performance-engineer` — the two failure modes that matter here are runtime-behavioural
and invisible to every static gate: a refetch storm (I-36) and a full-board skeleton flash
(I-34). Both are measured in devtools and the network panel, which is this reviewer's instrument.

**Reference:** `.claude/knowledge/stack.md`.

**Reviewer must specifically confirm:**
- `grep -n "queryKey" src/features/dashboard/api/*.api.ts` → **11** four-element keys whose 3rd and
  4th segments are the branch id and range key; `grep -rn "\['dashboard', '[a-zA-Z]*'\] as const" src/`
  → **nothing** (no 2-element key survives) (I-33);
- `grep -c "placeholderData: keepPreviousData" src/features/dashboard/api/*.api.ts` → 1 per file,
  11 files; **`grep -rn "keepPreviousData: true" src/` → nothing** — the v4 spelling
  silently does nothing (I-34 / F5-a / R7);
- the query scope is kept as a **single `scope` object**, not destructured — otherwise `from`/`to`
  are unused locals and `noUnusedLocals` fails (F5-c / I-20);
- all key segments are plain **strings** — no `Date`, no object, no array (I-33 / F5-e);
- **`grep -rn "\['dashboard'" src/ --include=*.ts --include=*.tsx`** — no
  `invalidateQueries`/`setQueryData`/`getQueryData` call site still asserts the old 2-element shape
  and has silently become a no-op (H-7 / F5-d);
- **the 11 widget loading predicates branch on `isPending`, not `isFetching`** — otherwise the
  board still flashes to skeletons on every switch and the feature's headline requirement is unmet.
  If one was wrong and was fixed here, it must be called out explicitly (F5-f / H-8);
- devtools: one branch switch → **exactly 11 fetches, then idle**; switching back to a previously
  used branch/range is served from cache with no fetch; no network activity while idle (I-36 / F5-e);
- I-1 held: no widget collapsed into a shared query or a shared error guard;
  `FinancialBillingWidget`'s two queries are still independent — spot-verify by throwing in
  `hmoClaims.api.ts` and confirming only the denial-rate tile degrades (I-1 / F5-g). **Confirm the
  debugging `throw` was reverted** — `git diff HEAD -- src/features/dashboard/api/` must show only
  the intended changes, which is precisely the kind of accident a scoped diff catches;
- **`git diff --stat HEAD -- src/features/dashboard/api/` → exactly 11 modified files**, with
  `fixtures.test.ts`, `delay.ts` and every `.fixtures.ts` absent from the diff (A5 / F5-j);
- **`git diff --stat HEAD -- src/features/dashboard/components/ src/features/dashboard/pages/`
  → empty**, proving decision D4's zero-caller-churn claim (unless a documented F5-f fix was
  needed);
  > **Both of the two gates above only exist because of P0.** Before the checkpoint commit,
  > `src/features/dashboard/` was entirely untracked and neither could run. *Under fallback B:*
  > the 11 recorded `*.api.ts` hashes changed and **no other hash** under
  > `src/features/dashboard/` did — which requires the full baseline enumeration from P0 step 5.
  > **If neither the SHAs nor the hashes were recorded, say so and mark these two unverifiable**
  > rather than passing them (I-41);
- every **BACKEND SWAP comment** was updated to the real URL with `branch`, `from` and `to`, and no
  file still claims "Nothing else in this file changes" if that is now false (F5-i) — the whole
  value of that comment is that the next engineer can trust it.

---

## Phase 6: Record decisions, refresh state and hypotheses

**Primary:** `frontend-developer` — transcribing shipped versions out of `package.json`, gate
readings out of the terminal, SHAs out of `git log`, and decisions out of what actually happened.
Low-judgement, high-accuracy work.

**Review:** `architect-reviewer` — the question is whether the decision log honestly records the
**tradeoffs** (store location and its ageing risk, the two-flag init model and why one flag could
not work, store-read-inside-hook over explicit args, `rangeKey` shape, the `present && healed`
write condition, partial staleness under `keepPreviousData`, **which P0 option was taken and why**,
and any chrome behaviour change forced by 360px) so the next engineer inherits reasoning rather
than a changelog. That is an architecture judgement about institutional memory.

**Reference:** `.claude/artifacts/decisions.md` (`D-cmo-ui-overhaul-1..7` — the tone and depth to
match).

**Reviewer must specifically confirm:**
- **`decisions.md` was appended to, not rewritten** — `grep -c '^## D-cmo-ui-overhaul-'` still
  returns **7**, and `D-cmo-branch-filter-*` entries are consecutive below them (I-23 / F6-b);
- **`D-cmo-branch-filter-1` explains why the init model needs two fields and not one** — the
  contradictory-initialiser argument, not just "we used two booleans". This is the entry that stops
  a future engineer "simplifying" the guard and re-introducing H-12/R2;
- **`D-cmo-branch-filter-2` records the exact CLI command that was run** — version pin, flags,
  whether the `components.json` redirection or the out-of-tree fallback was used — so the
  generation is reproducible (I-35b);
- **`D-cmo-branch-filter-9` records the actual P0 outcome** (I-41 / F6-d): that the overhaul was
  uncommitted at the start; **which option the user authorised**; the `BASELINE_SHA` if Option A,
  cross-checked against `git log`; and — if Option B was taken — an explicit statement that **no
  commits were made**, so a future reader does not go hunting for SHAs that never existed. It must
  also note that the checkpoint commit is what made the `.claude/.artifacts/design/` deletion
  permanent (I-29);
- `git diff HEAD -- .claude/artifacts/art-direction.md` is **empty** — no token was quietly
  legitimised after the fact (I-40 / F6-e). **Caveat to check first:** this assumes `.claude/` is
  tracked (A13). If it is gitignored, the gate passes for the wrong reason — **report it as
  vacuous and substitute the `shasum` recorded at P0** (I-41);
- `diff.md` and `checkpoint.md` are intact;
- **nothing** was written under the dotted `.claude/.artifacts/` and it still does not exist
  (I-29 / F6-a); `validate-manifest.mjs` was not run and no manifest was created to appease it
  (I-30 / F6-c);
- the pinned versions quoted in the decision log match `package.json` **verbatim**, and the
  `--legacy-peer-deps` outcome is what actually happened rather than what the plan expected
  (I-35 / F6-d);
- the open items carried forward (H-17 recharts/React-19 console + dark chart cascade; H-18 the
  header alert count / I-1 tension) are still visibly open and were not quietly dropped;
- `grep -n '{\.\.\.}' .claude/artifacts/*.md` → no template placeholders survive;
- **under Option A, the whole-feature check:** `git diff <BASELINE_SHA>..HEAD -- src/index.css
  components.json` is empty and `git log --oneline <BASELINE_SHA>..HEAD` shows six phase commits —
  the strongest single evidence that nothing unintended was swept in across the feature.
