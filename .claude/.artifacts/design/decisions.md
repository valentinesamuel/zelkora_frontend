# Decision Log

Append-only. Nothing is edited. Nothing is deleted.

IDs are `D-{feature-slug}-{n}`, sequential within each feature. They are scoped to
the feature rather than global so that two branches never allocate the same ID, and
so a merge never requires renumbering — renumbering would break every reference
pointing at a decision.

This is the pipeline's institutional memory. A decision recorded here is settled:
later stages may not reject work for it, and may only raise a Reopen Request naming
the ID and the new information that was not available when it was made.

Record a decision when a choice constrains later work, when an alternative was
seriously considered and rejected, or when someone in three months would ask "why
is it like this?".

---

## D-{feature-slug}-1 — {Title}
Author: {skill} (stage {n})
Date: {YYYY-MM-DD}
Context: {The situation requiring a decision.}
Decision: {What was decided.}
Reasoning: {Why.}
Alternatives: {What else was considered, and why it lost.}
Trade-offs: {What is being given up, stated plainly and accepted.}
Next Owner: {skill}

---

## D-role-dashboard-shell-1 — Persistent left sidebar as the app-wide navigation model
Author: senior-product-designer (stage 1)
Date: 2026-07-26
Context: This is the first feature and no navigation model exists yet. It is the
foundation `product-architecture.md` needs before any shell can be built, and
every future feature conforms to whatever is chosen here.
Decision: A persistent, collapsible left sidebar with icon+label destinations.
Ten top-level destinations: Dashboard, Patients, Queue & Appointments,
Consultations, Lab, Pharmacy, Billing & Claims, Inventory, Staffing, Reports.
Reasoning: User-specified (C-012), consistent with a dense internal tool used
by staff for extended daily hours who need every destination one click away.
Alternatives: Top nav with dropdown modules (adds a hover/click step to reach
secondary destinations); minimal/command-driven nav (higher learning curve,
works against the stated "low cognitive load, forgiving" user profile).
Trade-offs: Ten items is a lot for a sidebar; requires grouping/collapse
treatment at stage 4/5 rather than a flat list. Accepted — explicit per C-012.
Next Owner: frontend-architect (stage 4, and every future feature)

## D-role-dashboard-shell-2 — Dense (~32-36px) as the product-wide density target
Author: senior-product-designer (stage 1)
Date: 2026-07-26
Context: No density target existed. Craft.md requires one committed target held
everywhere; the dashboard's "no scrolling" AC also depends directly on it.
Decision: Dense: ~32px control height, ~36px queue-row height, space-3 (12px)
intra-section spacing, space-6 (24px) section spacing.
Reasoning: User-specified (C-011): staff live in the tool all day and value
speed/density; project-context.md explicitly wants density without assuming
power-user fluency, met by clear type hierarchy rather than looser spacing.
Alternatives: Comfortable (40-44px) — rejected, shows fewer queue items per
screen and works against the no-scroll AC at moderate-to-high queue volumes.
Trade-offs: Less touch-friendly, but this is a desktop-only feature per scope.
Next Owner: staff-ui-engineer (stage 5, and every future feature)

## D-role-dashboard-shell-3 — Live/real-time dashboard updates
Author: senior-product-designer (stage 1)
Date: 2026-07-26
Context: Queue and results state can change while the doctor is looking at the
dashboard (new check-in, result completed). Needed to know whether to design for
staleness or freshness.
Decision: The dashboard updates live. A new queue entry animates in (slide-in +
accent highlight-fade) rather than an abrupt re-render; a "Live" indicator with a
pulsing dot communicates freshness.
Reasoning: User-specified (C-010) — a "what needs my attention right now"
dashboard for staff who live in it all day fails its own purpose if it goes
stale.
Alternatives: Refresh on load/manual action only — simpler, no real-time
infrastructure assumption, but risks doctors acting on stale counts.
Trade-offs: Requires `frontend-architect` to design a polling or streaming
mechanism at stage 4 against the fixture-backed data layer; not yet specified
which transport.
Next Owner: frontend-architect (stage 4)

## D-role-dashboard-shell-4 — Fixed top-N with overflow count for queue display
Author: senior-product-designer (stage 1)
Date: 2026-07-26
Context: Queue volume varies and has no stated hard cap (C-006), but the AC
requires the dashboard fit on one screen with no scrolling.
Decision: The queue widget shows a fixed number of next patients ordered by
triage level then wait time, plus a count of how many more are waiting and a
launch point into the full queue view.
Reasoning: User-specified (C-007). Keeps the dashboard a launch point rather
than the system of record for the entire queue, and makes "no scrolling"
achievable at any real volume.
Alternatives: Compact/shrinking rows with no cap — rejected, becomes unreadable
at high volume and cannot guarantee no-scroll. Scrollable-within-widget —
rejected as bending rather than meeting the AC.
Trade-offs: A doctor with a very long queue does not see everyone at a glance —
mitigated by the overflow count and one-click link to the full queue.
Next Owner: senior-product-designer (own design-spec.md, this stage)

## D-role-dashboard-shell-5 — One hospital per staff account, no header switcher
Author: senior-product-designer (stage 1)
Date: 2026-07-26
Context: The business is multi-hospital/multi-tenant, but it was unclear whether
an individual staff account can span more than one hospital branch.
Decision: Assume one hospital per staff account for this feature; no
hospital-switcher in the shell.
Reasoning: User-specified (C-013); no evidence in `project-context.md` of
cross-branch staff, and project-context's multi-tenancy describes the platform
serving many hospitals, not one person spanning several.
Alternatives: Multi-hospital switcher in the header — rejected for now as
unevidenced scope, would become a permanent shell element affecting every
future feature's header layout.
Trade-offs: If a future feature discovers cross-branch staff are real, this
decision must be reopened and the shell header revised everywhere it shipped.
Next Owner: frontend-architect (stage 4, reopen if contradicted)

## D-role-dashboard-shell-6 — bp-sm (640px) is the narrowest verified viewport; sub-640px is unverified
Author: senior-product-designer (stage 1, iteration 1 — responding to design-reviewer's REJECTED verdict)
Date: 2026-07-26
Context: The rejected prototype tested and claimed correctness at an invented
360px checkpoint — narrower than any breakpoint token in `design-system.md`
(the smallest is bp-sm, 640px) — and the sidebar/header genuinely broke
there. Fixing arbitrary sub-640px widths would mean designing real mobile
chrome (a collapsing header search, a hidden/drawer sidebar), which
`current-feature.md`'s acceptance criteria explicitly does not require
("this feature does not need to solve mobile/tablet layouts unless trivial").
Decision: The prototype's narrow-viewport check now targets bp-sm (640px),
an actual committed breakpoint token, instead of 360px. The header title was
fixed to truncate with ellipsis rather than wrap/collide at narrow widths —
a genuine bug present even at 640px, and a trivial fix within existing scope.
Widths below 640px remain explicitly unverified and out of scope.
Reasoning: 640px is the narrowest width this design system commits to; making
that width actually work (not merely claimed) satisfies the "no scrolling
required" AC without inventing new mobile-specific design work the user never
asked for and the AC explicitly waives.
Alternatives: Redesign a true sub-640px mobile shell (icon-only sidebar,
collapsing header) — rejected as scope beyond what was asked or trivial;
removing the narrow-viewport check entirely — rejected because bp-sm is a
real, cheap-to-verify commitment and dropping it loses a checkpoint for free.
Trade-offs: Phone-class viewports (roughly <640px) remain fully unverified.
If a future feature needs real mobile use, this must be revisited with its
own clarification round on device/viewport requirements.
Next Owner: frontend-architect (stage 4, reopen if mobile/phone use surfaces)

## D-role-dashboard-shell-7 — Design review APPROVED at iteration 1
Author: design-reviewer (stage 2)
Date: 2026-07-26
Context: Iteration 0 was REJECTED on three Critical findings (fonts never
rendering, breakage at an untested 360px viewport, TriageChip urgent-text AA
failure) plus four Major and three Minor findings.
Decision: APPROVED. All three Critical findings verified fixed by independent
re-render and recomputation (font files present and loading; bp-sm/640px
genuinely works per `D-role-dashboard-shell-6`; TriageChip contrast
recalculated at ~5.16:1 light / ~6.63:1 dark, both clearing AA). All Major and
Minor findings from iteration 0 also verified cleared. One new Minor surfaced
(weight-500 text rendered via the 600-weight font file) — disclosed by the
producer, assigned to `staff-ui-engineer` as a Required Change for stage 5.
Reasoning: Verdict is derived mechanically from severity counts per
`review-protocol.md` — zero Critical, zero Major → APPROVED (with one
Required Change carried forward for the sole Minor).
Alternatives: None — this is a gate verdict, not a design choice.
Trade-offs: None.
Next Owner: ux-reviewer (stage 3)

## D-role-dashboard-shell-8 — Row/card clicks resolve to real routes, not dead clicks, even into unbuilt destinations
Author: ux-reviewer (stage 3)
Date: 2026-07-26
Context: AC #3 requires every dashboard row/card to be a direct launch point
into the patient chart, consultation view, or result detail. All three
destinations are marked "(future feature)" in `product-architecture.md`'s IA
table, and neither `design-spec.md` nor the prototype specifies what an
individual QueueRow, PendingResultRow, or "Open chart" click does today —
only the two overflow-footer links have partial routes. Left unresolved, this
feature could ship with every primary interaction being a dead click,
directly contradicting the AC's own "rather than a dead-end summary"
language.
Decision: Every row/card click must resolve to a real route consistent with
`product-architecture.md`'s URL patterns (e.g. `/patients/:patientId`), even
though the destination page itself does not exist yet as a built feature.
Reasoning: User-specified (C-020). Keeps AC #3 literally satisfiable now
rather than deferring navigation wiring to whichever future feature happens
to build the destination page, which would leave this dashboard's launch
points broken in production until then.
Alternatives: Leave rows inert until the target feature ships — rejected,
breaks the AC as written and trains doctors that dashboard rows don't do
anything.
Trade-offs: `frontend-architect` (stage 4) must define what renders at each
target route before its own feature exists — a stub/placeholder page, not a
404. This is new scope for stage 4 beyond routing the dashboard itself.
Next Owner: frontend-architect (stage 4)

## D-shadcn-tailwind-1 — Adopt Tailwind v4 + shadcn/ui; reverse INV-23 / "locked decision 7"
Author: operator / DE (task interrogation, pre-Phase 0)
Date: 2026-08-27
Context: The `zelkora_frontend` app shipped with hand-written plain CSS
(`src/index.css` Vite-starter reset, `src/features/auth/auth.css`, dead
`src/App.css`) under a prior standing decision recorded as INV-23 / "locked
decision 7": *"No Tailwind, no shadcn"*. Meanwhile `.claude/knowledge/stack.md`
mandates React 19 + Vite + TypeScript strict + Tailwind v4 + shadcn/ui, and the
design pipeline's `design-system.md` is expressed in OKLCH design tokens that
plain per-feature CSS cannot consume. The two could not both stand.
Decision: Reverse INV-23 / "locked decision 7". Adopt Tailwind v4 +
shadcn/ui per `.claude/knowledge/stack.md`. Remove ALL plain CSS. Reskin auth +
profile now.
Reasoning: The app must converge on the organisational stack before more domains
are built on top of the divergent one; every additional feature written in plain
CSS raises the migration cost and widens the gap to `design-system.md`. Doing the
reskin now, while the surface is two pages (auth + profile), is the cheapest this
migration will ever be.
Alternatives: (a) Keep plain CSS and retire `stack.md`'s Tailwind mandate —
rejected, `design-system.md`/`token-diff.mjs` and the whole design pipeline
assume a token-driven utility stack. (b) Adopt Tailwind but not shadcn (utilities
only, hand-rolled components) — rejected, gives up the accessible primitive set
and the `npx shadcn add` upgrade path for no saving. (c) Adopt incrementally,
leaving `auth.css` in place alongside Tailwind — rejected, two styling systems in
one app is the worst of both and tends to become permanent.
Trade-offs: A one-time reskin of every existing styled surface with a real
regression risk (accessibility wiring, focus states, form behaviour), plus new
dependencies (`tailwindcss`, `@tailwindcss/vite`, `class-variance-authority`,
`clsx`, `tailwind-merge`, `lucide-react`, `radix-ui`, `tw-animate-css`). Accepted:
the reskin was gated by an explicit 15-item parity checklist in Phase 5.
Next Owner: superseded/closed — executed across Phases 1-6; see D-shadcn-tailwind-6.

## D-shadcn-tailwind-2 — Ship the STOCK shadcn `neutral` theme; retokenising is a tracked follow-up
Author: operator / DE (task interrogation, pre-Phase 0)
Date: 2026-08-27
Context: `.claude/.artifacts/design/design-system.md` defines the project's real
OKLCH token set, and `.claude/knowledge/stack.md` states that shadcn's default
tokens MUST be replaced with art-direction values ("no default neutral ramp,
radius, or focus ring"). Wiring those tokens is a design-fidelity task of its own
size, independent of the toolchain migration; bundling them would have made a
single un-reviewable change.
Decision: Ship shadcn STOCK `neutral` theme. Wiring
`.claude/.artifacts/design/design-system.md` OKLCH tokens into
`src/styles/theme.css` is a TRACKED FOLLOW-UP, out of scope. This knowingly
violates `stack.md`'s "no default theme / tokens MUST be replaced with
art-direction values" rule until that follow-up lands.
Reasoning: Separates "does the toolchain work and does the app still behave" from
"does the app look like the approved art direction". A stock theme is a known,
documented baseline, which makes the later retokenisation a clean, reviewable
token-only diff rather than an entangled one.
Alternatives: (a) Retokenise in the same task — rejected as scope that would have
merged a toolchain migration and a visual redesign into one gate. (b) Invent
interim tokens — rejected, strictly worse than stock: undocumented, unapproved,
and harder to diff against `design-system.md` later.
Trade-offs: The app is knowingly off-brand and knowingly in violation of
`stack.md` until the follow-up lands. Encoded as **INV-T1**, an explicitly
time-boxed/expiring invariant that dies when the retokenisation ships — it is not
a permanent licence. Residual risk R13: the follow-up never happens and the stock
theme becomes permanent while `design-system.md` rots.
Next Owner: UNASSIGNED — see D-shadcn-tailwind-6(b) and state.md Q2. Needs a named
human owner and a ticket.

## D-shadcn-tailwind-3 — Scaffold shadcn primitives on demand only
Author: operator / DE (task interrogation, pre-Phase 0)
Date: 2026-08-27
Context: `npx shadcn add` can install an arbitrary number of primitives, and the
common failure mode is scaffolding the full example set "so it's there", leaving
dozens of unused, unreviewed, unpruned components in `src/components/ui/` that
nobody owns but every audit must read.
Decision: Scaffold primitives ON DEMAND only: `button input label card alert
spinner`. If `spinner` is absent from the registry, use lucide `Loader2` +
`animate-spin`. Do NOT add the full example set.
Reasoning: Those six are exactly what the auth + profile reskin consumes. Every
file in `components/ui/` is code this team owns and must keep passing strict TS,
ESLint, and review; unused primitives are pure liability.
Alternatives: Add the full shadcn set up front — rejected, unowned surface area
and noise in every future diff and review.
Trade-offs: Each future feature pays a small `npx shadcn add <name>` step. Cheap,
and it keeps the addition visible in review. Phase 6 pruned the scaffolds further
(Button variants/sizes, Card `size`) against whole-`src/` grep evidence of zero
call sites — restore variants when a real consumer needs them.
Next Owner: closed — Phase 3 (scaffold) + Phase 6 (prune). H2 resolved; see
D-shadcn-tailwind-6(e).

## D-shadcn-tailwind-4 — TanStack Query as infrastructure only; domain hooks live in features
Author: operator / DE (task interrogation, pre-Phase 0)
Date: 2026-08-27
Context: The app's auth session lifecycle (bootstrap / refresh / login) is
already implemented on Zustand + the single `apiRequest` seam in
`src/lib/apiClient.ts`, protected by INV-13 (one-way `authStore → apiClient`) and
INV-14 (all HTTP through `apiRequest`). Introducing TanStack Query invited an
opportunistic rewrite of that lifecycle into `useQuery`. Separately,
`stack.md` documents a global `src/api/` seam.
Decision: TanStack Query INFRASTRUCTURE ONLY (provider + singleton `QueryClient`
+ dev-only devtools). Do NOT convert the auth session lifecycle:
bootstrap/refresh/login is client state, stays on Zustand + `apiClient`
(INV-13/INV-14 untouched). Domain query hooks will live at
`features/<domain>/api/*.api.ts`, NOT a global `src/api/`. This diverges from
`stack.md`'s global `src/api/` seam — recorded deliberately.
Reasoning: Auth session state is genuinely client state with imperative
sequencing (token refresh, failure callbacks), not server-cache state; modelling
it as a query buys nothing and risks the app's most sensitive path. Co-locating
query hooks with their domain keeps the feature slice vertical and self-contained
and avoids a global directory that grows into a cross-domain junk drawer.
Alternatives: (a) Convert auth to TanStack Query — rejected, high risk to
INV-13/INV-14 for no benefit. (b) Global `src/api/` per `stack.md` — rejected,
contradicts the feature-first architecture this task is encoding; a global seam
makes every feature import sideways into shared domain code.
Trade-offs: A documented divergence from `stack.md` that a future reader could
mistake for drift — mitigated by recording it here, in `src/features/README.md`,
and again in D-shadcn-tailwind-6(c). Also: no domain query hook exists yet, so the
convention is asserted rather than proven by use.
Next Owner: the first feature to add a domain query hook (must create
`features/<domain>/api/<name>.api.ts`, not `src/api/`).

## D-shadcn-tailwind-5 — Keep the prop-based `components/form` primitives; do not adopt shadcn's `Form` stack
Author: operator / DE (task interrogation, pre-Phase 0)
Date: 2026-08-27
Context: `src/components/form/FormField.tsx` and `FormError.tsx` are existing
domain-agnostic, prop-driven primitives (INV-F3/F4/F5: no CSS of their own, pure
functions of props, no hooks, binding only via an RHF `register()` return). shadcn
ships a competing context-based `Form`/`FormField`/`FormItem`/`FormControl` stack
built on `react-hook-form`'s `FormProvider`.
Decision: KEEP prop-based `components/form/{FormField,FormError}`. Do NOT adopt
shadcn's context-based `Form`/`FormField`/`FormItem`/`FormControl` stack this
task. When `FormField` is first consumed it should compose `<Input>`/`<Label>`
internally.
Reasoning: The existing primitives already carry correct accessibility wiring
(`aria-invalid`, `aria-describedby`, `noValidate` + `handleSubmit`) that the three
auth step components depend on. Swapping in a context-based stack would rewrite
every form in the app during a phase whose stated goal was zero behavioural or
accessibility regression.
Alternatives: (a) Adopt shadcn's `Form` stack now — rejected, couples a styling
migration to a forms-architecture migration. (b) Run both — rejected, two form
conventions is worse than either.
Trade-offs: The app forgoes shadcn's ergonomic context API and diverges from
shadcn form examples, so copy-pasting registry form snippets needs adaptation.
Accepted. Phase 5 consequence: `auth-input`/`auth-label` were reskinned by passing
mirrored Tailwind utilities as `inputClassName`/`labelClassName` props rather than
swapping in `<Input>`/`<Label>`, to respect the frozen `FormField` API — which also
meant the flagged RHF `ref`-forwarding risk never arose.
Next Owner: the first feature to consume `FormField` (compose `<Input>`/`<Label>`
inside it at that point).

## D-shadcn-tailwind-6 — Task change-log and resolved outcomes
Author: architect-reviewer (Phase 7)
Date: 2026-08-28
Context: Phases 1-6 executed the Tailwind v4 + shadcn/ui migration (toolchain,
`shadcn init`, primitive scaffolding, app shell + Query infrastructure, auth +
profile reskin, dead-CSS deletion + pruning). Several of the plan's open
hypotheses, risks, and deliberate rule violations resolved during execution and
must be recorded in one place so a later reader does not have to reconstruct them
from six checkpoints — and so the one still-open item cannot quietly disappear.
Decision: Record the following eight outcomes as settled facts of this task.

  **(a) INV-23 reversal — DONE.** The standing decision *"No Tailwind, no shadcn"*
  (formerly INV-23 / "locked decision 7") is **REVERSED** by
  D-shadcn-tailwind-1. Tailwind v4 (`tailwindcss@4.3.3` +
  `@tailwindcss/vite@4.3.3`) and shadcn/ui (`shadcn@4.19.0`) are now the adopted
  styling stack. All plain CSS is gone: `src/features/auth/auth.css` and
  `src/App.css` deleted, the Vite-starter reset removed from `src/index.css`,
  which is now the sole CSS file in `src/` (INV-C1). No source file repeats the
  now-false claim — verified in Phase 7 by
  `grep -rn "INV-23\|locked decision 7" src` returning zero matches.

  **(b) D-2 follow-up — TRACKED, OUTSTANDING, AND UNOWNED.** The stock shadcn
  `neutral` theme shipped per D-shadcn-tailwind-2 / INV-T1 **knowingly violates**
  `.claude/knowledge/stack.md`'s rule that tokens MUST be replaced with
  art-direction values (no default neutral ramp, radius, or focus ring). Wiring
  `.claude/.artifacts/design/design-system.md`'s OKLCH tokens into
  `src/styles/theme.css` is **TRACKED AND STILL OUTSTANDING** at the close of this
  task. **No named owner has been assigned** — `state.md`'s open question **Q2**
  ("who owns the retokenising follow-up, and by when?") is **UNRESOLVED**, and
  risk R13 (the stock theme becomes permanent while `design-system.md` rots)
  therefore remains live. **This needs a human-assigned owner and a ticket before
  it can close.** INV-T1 is time-boxed and expires on that follow-up; it is not a
  permanent licence and must not be cited as precedent for shipping default
  tokens again.

  **(c) D-4 divergence — deliberate, not an oversight.** Domain query hooks live
  at `features/<domain>/api/*.api.ts`; there is no global `src/api/` directory and
  none should be created. This **diverges from `.claude/knowledge/stack.md`'s
  documented global `src/api/` seam** and is **recorded deliberately** (see
  D-shadcn-tailwind-4). Anyone reading `stack.md` and this repo together should
  treat the feature-local convention as authoritative here, and is also encoded in
  `src/features/README.md`.

  **(d) H1 resolved — CONFIRMED.** Hypothesis H1 (would the `@tailwindcss/vite`
  plugin work on Vite 8, or would a PostCSS fallback be needed?) was **CONFIRMED
  at runtime in Phase 1**: `@tailwindcss/vite@4.3.3` worked directly on
  `vite@8.2.1` (probe utility compiled to OKLCH in the built CSS). **The PostCSS
  fallback was never needed and never taken.**

  **(e) H2 resolved — CONFIRMED.** Hypothesis H2 (`spinner` availability in the
  shadcn registry) was **CONFIRMED in Phase 3**: `spinner` is present in the
  shadcn v4 registry and installed normally; it wraps lucide's `Loader2Icon`
  internally. **The manual `Loader2` + `animate-spin` fallback contemplated by
  D-shadcn-tailwind-3 was not needed.** (Open backlog item R22, noted not
  introduced: `spinner.tsx` has no `motion-reduce:` / `prefers-reduced-motion`
  handling on `animate-spin`, which the `stack.md` a11y floor requires.)

  **(f) `--legacy-peer-deps` — NOT required.** **NO.** Every phase (1 through 6)
  completed a clean `npm install` / `npx shadcn init` / `npx shadcn add` with
  **zero peer-dependency conflicts on React 19**. The flag was never used, and a
  future contributor hitting a peer conflict should treat it as new information,
  not as this stack's normal state.

  **(g) Phase 2 amendment — v3 → v4 re-init, `new-york` → `radix-nova`.**
  `shadcn init` was first run on **v3 (3.8.5)**, then **re-run on `shadcn@latest`
  (v4.19.0) by explicit user instruction**, switching `style` from `new-york` to
  **`radix-nova`** (v4's `-b radix -p nova`) while **`baseColor: "neutral"` stayed
  intact** (D-2 preserved) — **token values byte-identical** to the v3 run. Two
  v4-only init side effects were reverted to respect phase boundaries: the
  auto-scaffolded `src/components/ui/button.tsx` (deleted — Phase 3's job per D-3)
  and a bundled Geist font (import, theme vars, `html` rule, and npm dep all
  stripped — ~76 kB of dead-weight `.woff2` in `dist/`, outside D-2's token-only
  scope). Pre-amendment state backed up to `.claude/artifacts/backup-phase2-v3/`.
  Also discovered in Phase 2/3: `shadcn init` **MERGES** into an existing
  `index.css` rather than overwriting it (superseding the plan's R4 assumption),
  which is what left the Vite-starter reset alive until Phase 6.

  **(h) Phase 6 in-flight regression and same-phase fix.** A `:root` dedup pass on
  `src/index.css` **briefly dropped shadcn's own `--border` and `--accent` custom
  properties** — a name collision with the legacy Vite-starter block being removed
  (risks R19/R20) — leaving light mode with undefined borders and accents. This
  was **invisible to `tsc -b`, `build`, `lint`, and `test`**; it was caught by the
  Review agent before sign-off, by diffing `:root` against `.dark` and
  `@theme inline`, and **fixed in the same phase** by restoring the two
  stock-neutral values matching the existing `.dark` pair. Standing lesson: any
  merge or dedup of `:root`/`.dark` token blocks requires an explicit
  symmetric-coverage check — every token defined in `.dark` must also resolve in
  `:root` — because no automated gate in this repo catches its absence.

Reasoning: These items are exactly the ones a future reader would otherwise
mis-diagnose: (a) contradicts a decision still written down elsewhere in project
history; (b) is a live, unowned violation of an organisational rule and the single
most likely thing to rot; (c) looks like drift from `stack.md` but is not; (d)-(f)
close hypotheses whose fallbacks are still described in the plan and would
otherwise be re-litigated; (g)-(h) explain non-obvious file states
(`radix-nova` + `neutral`, restored `--border`/`--accent`) that would look like
mistakes without context. Consolidating them into one decision entry makes the
task auditable from this file alone.
Alternatives: Leave these in the per-phase `checkpoint.md` / `state.md` only —
rejected, those are working documents scoped to the pipeline run, while
`decisions.md` is the institutional memory that survives it. In particular the
unowned D-2 follow-up would have expired with the run.
Trade-offs: This entry mixes a policy reversal, an outstanding obligation, and
execution history in one record, which is broader than a single decision. Accepted
for traceability: each point is separately labelled (a)-(h) so it can be cited
individually. It also does not, and cannot, resolve Q2 — that requires a human.
Next Owner: **human / DE — assign an owner and ticket for the D-2 retokenising
follow-up (point (b), state.md Q2, risk R13) so INV-T1 can expire.** Secondary:
the next feature author, who inherits the contracts in `src/features/README.md`,
`src/components/shared/README.md`, and `src/app/layouts/README.md`.

## D-shadcn-tailwind-7 — Reopen D-shadcn-tailwind-5 — replace the prop-based `components/form` primitives with shadcn's context-based Form stack
Author: operator / DE (task interrogation, pre-Phase 8)
Date: 2026-08-29
Context: D-shadcn-tailwind-5 (2026-08-27) decided to KEEP `components/form/{FormField,FormError}`
prop-based (INV-F3/F4/F5 — no CSS of their own, pure functions of props, no hooks, binding only
via an RHF `register()` return) and explicitly REJECTED shadcn's context-based `Form` stack. Its
grounds were that swapping to a context stack would rewrite every form in the app during a phase
whose stated goal was zero behavioural or accessibility regression. Two pieces of new information
reopen it. First, the user's objective changed: shadcn-native forms are now an explicit goal in
their own right — the user wants a component library genuinely based on shadcn, not shadcn styling
draped over a bespoke forms architecture. The rewrite risk D-5 avoided is therefore no longer an
incidental cost of a styling migration; it is the accepted price of the objective itself. Second,
the audit found that the "frozen `FormField` API" which D-5's Phase 5 consequence protected had in
practice produced 12 hand-copied Tailwind class constants spread across 3 files, passed in as
`inputClassName`/`labelClassName`, and those copies had already drifted from `ui/input.tsx`. That
is a maintenance cost D-5 did not anticipate when it treated the frozen API as the cheap option.
Decision: Replace `FormField`/`FormError` with shadcn's
`Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`, from
`src/components/ui/form.tsx` — hand-authored rather than scaffolded, because the `radix-nova`
shadcn style has no `form` registry entry (confirmed by a direct registry fetch, not inferred) —
built on `react-hook-form`'s `FormProvider` + `Controller`. `src/components/form/` is DELETED.
INV-F3, INV-F4, INV-F5 and INV-F8 are RETIRED: they described files that no longer exist.
Reasoning: One form convention across the app, which is the same argument D-5 used against running
both stacks — it now points the other way. The field input is literally `ui/input.tsx` instead of
a hand-copy of its classes that can drift. shadcn's `Form` renders no DOM of its own (it is just
`FormProvider`), so the existing `noValidate` + `handleSubmit` submission path and the `ApiError`
handling survived untouched — verified byte-equivalent in Phase 9's review rather than assumed.
Alternatives: (a) Let D-5 stand — rejected, the user's objective changed and D-5's stated grounds
no longer describe the situation. (b) Migrate `FormField` only and keep `FormError` — rejected,
leaves two form conventions in the app, which D-5 itself argued was worse than either alone.
(c) Hand-roll a bespoke context stack with the same ergonomics — rejected, all of the migration
cost with none of the registry upgrade path or shared-vocabulary benefit.
Trade-offs: Accessibility parity is close but not identical, and each delta was applied or
accepted deliberately. (1) The scaffolded `FormMessage` was patched to add `role="alert"`, which
stock shadcn drops and the old `FormError` had. (2) A `FormDescription` was added to both MFA
fields so their `aria-describedby` does not dangle. (3) `aria-invalid="false"` is now rendered
explicitly on valid fields, where previously the attribute was simply absent. (4) The label is now
a sibling element with `htmlFor` rather than wrapping the input. (5) Error element ids changed
shape. Separately and knowingly accepted: `CredentialsStep`'s email and password fields still
carry a dangling `aria-describedby` reference to a `FormDescription` that does not exist on those
fields — documented in this task's parity-delta analysis and accepted because, unlike the MFA
fields, they have no natural description copy worth inventing. Most importantly, and this bounds
confidence in everything above: the entire verification for this task rested on a 24-row manual
matrix, because this repo's Vitest suite is a single node-environment file
(`src/lib/apiClient.test.ts`) that renders no components at all and therefore could not have
caught a regression here.
Next Owner: the next feature author building a form — use `@/components/ui/form`; there is no
`src/components/form/` any more.

## D-shadcn-tailwind-8 — Adopt shadcn `input-otp` for MFA passcode entry — reopen INV-A2 and accept a client-side 6-digit constraint the backend does not enforce
Author: operator / DE (task interrogation, pre-Phase 8)
Date: 2026-08-29
Context: `src/features/auth/schemas.ts` documents that the backend binding for `Passcode` is
`required` only — no 6-digit rule, no length rule, no charset rule — and states INV-A2: never add
a client-side rule the backend does not enforce, because a client rule stricter than the server is
a lockout. shadcn's `input-otp` structurally requires a fixed `maxLength` and a fixed number of
slots, which is exactly such a rule. The lockout risk was raised explicitly with the user by the
Distinguished Engineer during planning; the user weighed it and confirmed adoption twice, the
second time after direct pushback. This entry exists so that the acceptance is on the record as a
decision, rather than inferred later from the code.
Decision: Scaffold shadcn `input-otp` and use a 6-slot `InputOTP` for the `passcode` field in both
`VerifyMfaStep.tsx` and `EnrollMfaStep.tsx`. INV-A2 is REOPENED — it is no longer an absolute. It
now reads "never add a client rule the backend does not enforce, except where a deliberate,
recorded decision accepts the constraint," with this entry as its sole current exception.
`src/features/auth/schemas.ts` was deliberately NOT changed: the 6-digit constraint lives in the
widget only, via `maxLength={6}` and with no `pattern` restricting charset, so the trade-off has
exactly one reversal point instead of two. Verified in Phase 10's review: no digit-only `pattern`
was added, so the client still accepts non-digit characters — only the length is capped, which is
the minimum necessary form of the exception.
Reasoning: MFA entry is a high-friction moment — transcribing a code by hand against a
time-limited TOTP window. Per-digit auto-advance and paste-splitting are material UX gains on what
is the app's most-repeated interaction. The backend passcode format has been 6-digit TOTP since
inception, and no backup-code or variable-length format is planned. Adding one primitive on demand
for two real consumers complies with this project's existing on-demand scaffolding convention
(D-shadcn-tailwind-3) rather than bending it.
Alternatives: (a) Keep a plain `<Input inputMode="numeric">` — honours INV-A2 exactly as written;
rejected by the user in favour of the UX gain. (b) Adopt `input-otp` and also add a `.length(6)`
zod rule for consistency — rejected, it duplicates the constraint in two places and doubles the
cost of reversing it. (c) Defer as a tracked follow-up — rejected, this repo already carries one
unowned, unclosed follow-up (the D-2 retokenising follow-up, tracked in D-shadcn-tailwind-6(b))
and does not need a second.
Trade-offs: Stated plainly, verbatim:
MFA login will reject any future backend passcode format that is not exactly 6 digits, until the frontend is patched.
Backup codes, alphanumeric codes, or any change
in TOTP digit count would all fail silently at the client, with no server round-trip and no
diagnostic to point at the cause. This is knowingly accepted, not overlooked. Also accepted: a new
runtime dependency, `input-otp`. Mitigating it, reversal is a single-file-pair change — swap
`InputOTP` back to `Input` in the two MFA steps — and that cheapness is part of why the risk is
acceptable at all.
Next Owner: whoever changes the backend passcode format — they MUST patch `VerifyMfaStep.tsx` and
`EnrollMfaStep.tsx` in the same change, or MFA login breaks. Record that obligation alongside any
change to the backend `Passcode` binding.
