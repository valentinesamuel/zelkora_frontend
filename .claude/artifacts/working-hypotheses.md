# Working Hypotheses — Global Branch Switcher & Working Date Range

Beliefs about this system that are **not yet proven by execution**. Each carries a status, the
evidence that would settle it, and what changes if it is false. Anything still `UNVERIFIED` at
the end of a phase is a reviewer's job, not a footnote.

Status legend: **VERIFIED** (evidence in hand) · **LIKELY** (strong reasoning, no execution) ·
**UNVERIFIED** (must be checked) · **FALSIFIED**.

**Revision:** DE review round 1 applied — H-12 rewritten for the two-field init model; H-19
(CLI non-interactivity) and H-20 (fresh-profile write) added.

---

## Dependency surface

### H-1 — `radix-ui@1.6.7` already provides `Select` and `Popover`, so shadcn adds no dependency for them — **VERIFIED**
`node_modules/radix-ui/dist/index.d.mts:38` → `export { reactPopover as Popover }`;
`:48` → `export { reactSelect as Select }`. `src/components/ui/tooltip.tsx:2` proves the house
idiom is `from "radix-ui"`. **Consequence:** the React-19 peer-dep risk for the select/popover half
of this feature is **zero**, and the "hand-roll vs. shadcn" debate for the switcher is settled in
shadcn's favour on cost grounds alone. Do not spend risk budget here.

### H-2 — The shadcn CLI will nonetheless add `@radix-ui/react-select` / `-popover` to `package.json` — **UNVERIFIED**
Registry behaviour for `style: "radix-nova"` is not knowable without running it. **Evidence:**
`git diff package.json` after Phase 2. **If true:** remove the packages and rewrite the generated
imports to the unified form (F2-b). Two Radix copies means two context instances and a larger
bundle. **If false:** Phase 2 adds exactly one dependency.

### H-3 — `react-day-picker@9` installs clean against React 19.2 — **UNVERIFIED**
`recharts@3.10.1` installed with no `ERESOLVE` and no `--legacy-peer-deps`
(`D-cmo-ui-overhaul-3`), so this repo's React-19 friction has been low. rdp v9 declares a broad
React peer range. **Evidence:** the install log. **If false:** pin exact + `--legacy-peer-deps`,
record it. **If it will not install at all:** the fallback is presets-only with "Custom…" disabled
plus an escalation to the user — **not** a hand-rolled calendar (D3).

### H-4 — `react-day-picker` bundles `date-fns` transitively, so the explicit install is redundant — **UNVERIFIED, and deliberately ignored**
Even if true, `dateRange.ts` imports `date-fns` directly and must declare it. Relying on a
transitive dependency is how a minor bump of rdp silently breaks the resolver. **Install and pin
`date-fns` explicitly in Phase 1 regardless.** The only thing to check is that Phase 2 does not
re-caret or bump it.

### H-19 — `shadcn@4.19.0 add` can be made fully non-interactive with `CI=1` + `npx --yes` + `--yes` + `--cwd .` — **UNVERIFIED, and the plan does not depend on it being true**
The CLI's prompt surface (overwrite / install-dependencies / config) is not knowable without
running it, and the Operator has no TTY. **This is deliberately structured so the hypothesis does
not need to hold:** `< /dev/null` converts any unsuppressed prompt into an immediate EOF failure
rather than an indefinite hang, and the documented out-of-tree fallback (generate in `/tmp` against
a copied `components.json`, copy the three `.tsx` files in by hand, install `react-day-picker`
separately) produces the same result with zero prompts.
**Evidence:** the command's exit status and the recorded transcript.
**What must NOT happen if it is false:** dropping `< /dev/null` and answering by hand. That
produces identical files and an irreproducible run — the reviewer then cannot confirm what was
generated, and I-35b is broken silently. **Also unverified and deliberately unused:**
`--overwrite`. The three target files are verified absent, so the flag buys nothing and arms the
CLI to clobber a `components/ui` file on a name collision with `--yes` suppressing the warning.

### H-5 — `AppHeader` already overflows at 360px, before any switcher is added — **UNVERIFIED**
`grid-cols-[1fr_auto_1fr]` with a fixed `h-8 w-60` (240px) centre search button, `px-4`, plus a
`w-16` collapsed sidebar leaves ~80px total for the greeting and the bell at 360px. It is
plausible the header is *already* tight. **Evidence:** the Phase-0 baseline capture at 360×740,
before Phase 3. **Why it matters:** without this capture, any 360px overflow found in Phase 3 gets
mis-attributed to the switcher and "fixed" by degrading the switcher, when the real fix is the
centre search button. Capture it **before** touching anything.

---

## Type system & React Query

### H-6 — `['dashboard','edFlow', scope.branchId, scope.rangeKey] as const` with `branchId: string` yields `readonly ['dashboard','edFlow',string,string]` and satisfies React Query's key type — **LIKELY (high confidence)**
`as const` on an array literal produces a readonly tuple; non-literal elements keep their declared
type rather than narrowing. `QueryKey` is `readonly unknown[]`, which this satisfies.
**Evidence:** `npm run build` in Phase 5. **The real narrowing hazard is elsewhere:** if
`branchId` were ever typed as a union of `BRANCHES` ids, any `queryClient.setQueryData` call
passing a plain `string` would stop compiling. Keep the store's `branchId` as `string`.

### H-7 — Nothing in the repo asserts the current **2-element** dashboard key shape — **UNVERIFIED**
No `invalidateQueries` / `setQueryData` / `getQueryData` call against `['dashboard', …]` was found
during planning, but this was not exhaustively grepped. **Evidence:**
`grep -rn "\['dashboard'" src/ --include=*.ts --include=*.tsx` in Phase 5. **If false:** those call
sites need the new segments (or a prefix-only key), or they will silently stop matching and their
invalidations will become no-ops — a bug with no error message.

### H-8 — `placeholderData: keepPreviousData` keeps `isPending === false` across a key change, so widgets branching on `isPending` never flash — **LIKELY**
Documented React Query v5 behaviour: previous data becomes placeholder data, `isPending` stays
false, `isPlaceholderData` becomes true. **Evidence:** devtools during the E2E pass.
**If false, or if any widget branches on `isFetching` instead of `isPending`:** that widget flashes
a skeleton on every switch and the feature's headline requirement is unmet. **Audit all 11 widget
loading predicates in Phase 5 (F5-f)** — this is the single most likely way the feature ships
"working" but feeling broken.

---

## Theme, motion & the CLI

### H-9 — The global `prefers-reduced-motion` backstop at the bottom of `src/index.css` covers Radix's `animate-in` / `zoom-in-95` / `fade-in-0` classes — **UNVERIFIED**
It was written for chart entrance, tooltip fade and the sidebar width transition. Whether its
selector reaches `tw-animate-css`'s keyframe utilities on a portalled `PopoverContent` is not
known. **Evidence:** DevTools → Rendering → *Emulate `prefers-reduced-motion: reduce`*, open the
select and the calendar. **If false:** add `motion-reduce:animate-none` /
`motion-reduce:transition-none` **on the components** (I-17) — **never** edit `src/index.css`
(I-40).

### H-10 — `npx shadcn add` will write into `src/index.css` — **UNVERIFIED, treated as probable, and neutralised structurally**
`components.json` sets `"tailwind": { "config": "", "css": "src/index.css" }`. The CLI's normal
behaviour is to inject CSS variables into that file. Rather than revert afterwards and hope the
diff is reviewable, Phase 2 **redirects the `css` target to `src/__shadcn-scratch.css` for the
duration of the run**, then restores `components.json` verbatim and deletes the scratch file.
**Evidence:** `git diff src/index.css`, `git diff components.json`, and the absence of the scratch
file at phase end. **If the calendar genuinely needs a missing token:** stop and escalate — a new
token needs a `.dark` counterpart (I-6) and an `art-direction.md` amendment, neither of which is in
scope. The existing `--popover`, `--popover-foreground`, `--accent`, `--muted`, `--border` and
`--ring` should be sufficient.

### H-11 — The generated `calendar.tsx` ships Tailwind arbitrary values and/or a non-component export — **UNVERIFIED**
shadcn's calendar historically uses `w-[--cell-size]`-style classes and sometimes exports a
`CalendarDayButton` helper. `var(--…)` forms are token-diff exempt; literal px/rem forms are not
(I-7), and a non-component export in a `.tsx` fails lint (I-22). **Evidence:** token-diff count and
`npm run lint` at the Phase 2 boundary.

---

## Behaviour & state

### H-12 — A returning user's persisted branch survives `authStore` bootstrap — **UNVERIFIED, and still the most likely bug in the feature**
The store initialises at module-eval time when `user` is `null`; `useBranchHydration` then fires
once when `user` arrives. **DE review round 1 found the original spec's root cause:** a single
`hydratedFromUser` boolean was being asked two different questions whose correct initialisers are
**contradictory** — "was anything persisted?" (`true` for a returning user) and "has the one-shot
seed run?" (`false` for everyone at session start). No single value satisfies both.

The model is now two fields (I-31b / D7):
- **`persistedOnInit`** — assigned once from `decodeFilters().present`, **never mutated**, so it is
  still `true` on the hundredth render after auth resolves;
- **`userSeedApplied`** — starts `false`, flipped exactly once by `markUserSeedApplied()`, which is
  called **unconditionally** inside the `user !== null` branch (F3-j).

**Evidence:** pick branch #3 → reload → still #3. Then clear storage → reload → seeded from
`user.branchId`. Both paths must be walked; testing only one hides the opposite defect.
**If it regresses:** the switcher still *appears* to work and silently forgets, which reads as a
data bug rather than a state bug — which is exactly why it survives casual testing. The two ways it
comes back are re-merging the flags, or deriving `persistedOnInit` from current store contents
instead of the init snapshot.

### H-20 — A brand-new user's `localStorage` stays untouched until they change something — **UNVERIFIED, newly specified in DE review round 1**
`decodeFilters(null, today)` must return `{ present: false, healed: false }`, and the store's init
write-back must be guarded on `present && healed` (I-32c). The original spec conflated "nothing was
stored" with "something needed healing", which would have persisted the default blob for every new
user at first module-eval — contradicting I-32b (writes belong in setters) and, in private mode,
re-attempting a doomed (caught) write on every single load.
**Evidence:** clear the key → load the app → touch nothing → DevTools Application shows
`zelkora.dashboard.filters` **absent**. Change the branch once → the key appears.
**The opposite defect is equally real:** healing a genuinely bad stored value *without* rewriting it
means it is re-read and re-healed forever. Both halves of `present && healed` are load-bearing and
pull in opposite directions (F1-e).

### H-13 — With `dev-branch` at `BRANCHES[0]` (D6), the seeded `dev-cmo` user never sees a post-auth re-key — **LIKELY**
`DEFAULT_BRANCH_ID === 'dev-branch' === user.branchId`, so the seed is a no-op for the demo user.
**Evidence:** devtools shows no key change after auth resolves on a cold load with empty storage.
**If false / for other users:** one extra refetch per query on cold load, absorbed by
`keepPreviousData`. Acceptable, but note it rather than rediscovering it.

### H-14 — Midnight rollover re-keys the queries once and is harmless — **LIKELY, accepted**
`todayIso()` is read at render; a tab left open past midnight produces a new `rangeKey` on the next
render, triggering one refetch. Correct behaviour for a "Today" preset. **Watch for:** a
`setInterval` or a store write being added to "fix" it — that would create the storm I-36 forbids.

### H-15 — `resolveRange` on the first day of a quarter/year returns `from === to`, and that is correct — **LIKELY**
`startOfQuarter('2026-07-01') === '2026-07-01'`. This looks like a bug and will be "fixed" by
someone unless it is a named test case (F1-f). **Evidence:** the Phase 1 test matrix.

### H-16 — Fixtures being branch-agnostic makes partial staleness during a switch invisible — **VERIFIED by design, but time-limited**
Every fixture returns the same payload for every branch (resolved requirement), so the ~300 ms
window in which some widgets show previous data and some show new is unobservable. **This stops
being true the moment a real backend lands.** Recorded as R13 / `D-cmo-branch-filter-8` so the
follow-up (an `isPlaceholderData` opacity or `aria-busy` treatment) is a known option, not a
surprise.

---

## Carried forward from the overhaul — still open

### H-17 (was R20) — recharts v3 emits no React-19 runtime warnings, and `fill="var(--chart-*)"` resolves correctly under `.dark` — **UNVERIFIED**
The charts were wired in the overhaul's Phase 5 but never exercised in an interactive
`npm run dev`. **Fold into this feature's E2E pass** — the console is open anyway and the dark
mode toggle is already on the checklist. Costs nothing extra.

### H-18 (was R9 / Q8) — the dashboard header has no critical-alert count, because it would need a hoisted `useSystemAlerts()` and break I-1 — **OPEN, user decision**
Untouched by this feature. Note that Phase 4's header restructure into a
`flex justify-between` row creates a natural slot for a **self-querying** header-alert component
that would satisfy I-1 — but adding it is out of scope and needs the user's word.
