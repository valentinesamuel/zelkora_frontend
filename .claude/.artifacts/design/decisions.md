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
