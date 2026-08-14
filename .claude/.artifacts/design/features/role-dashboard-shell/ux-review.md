# UX Review — Role Dashboard Shell (Doctor instance)
Reviewer: ux-reviewer · Stage 3 · Iteration 0 · Scope: full · 2026-07-26
Reviewed: `current-feature.md` (acceptance criteria), `design-spec.md`,
`prototype/index.html` + `theme.css` + `NOTES.md` (all six proto-bar states,
collapsed/expanded sidebar, 640px viewport toggle), `design-review.md`
(verdict and required changes — not repeated here), `project-context.md`,
`product-architecture.md`, `clarifications.md` (C-001–C-022, including this
review's own C-019–C-022).

## Task summary

A doctor lands on the dashboard and, within seconds and without scrolling,
needs to see their patient queue, current consultation, and results awaiting
sign-off — and reach the corresponding deeper workflow in one click from any
of them. Success is measured by AC #1–#3 in `current-feature.md`, which are
observable rather than aspirational.

## Journey walkthrough

**Primary journey (populated queue, "Default" state):** doctor arrives →
personalized greeting confirms identity/time-of-day → three widgets are
visible in one glance, no scroll, at 1440px → Queue shows next 6 patients
ordered by triage then wait, with a live pulse and overflow count → Current
Consultation shows the active patient and two actions → Awaiting Review shows
up to 6 flagged/unflagged results. Interaction cost to reach any deeper
workflow is nominally one click (AC #3's requirement) — but see Major finding
below: neither the spec nor the prototype states where that click actually
goes, since the destination screens (patient chart, consultation view, result
detail) are themselves future features. This was not assumed; it was asked
and resolved via C-020/`D-role-dashboard-shell-8` before this verdict was
formed.

**Wrong-turn journey:** a doctor clicks a disabled nav item (Patients, Lab,
etc.) expecting it to work, since it looks identical in weight/spacing to the
enabled Dashboard item and carries no visual "not yet available" signal
(confirmed by reading `index.html` — plain `disabled` attribute, no title/
tooltip). They get no feedback at all and are left to guess whether the click
registered. See Major finding below.

**Interrupted journey:** a doctor mid-way through ending a consultation is
covered for the happy path (optimistic completion, toast confirmation,
already-settled per `product-architecture.md`'s cross-feature pattern — not
re-litigated here). It is not covered for the unhappy path: neither
`design-spec.md` nor the prototype states what happens if that request fails
after the doctor has already moved on. See Major finding below.

## Scores
Task Completion: 6/10 — the dashboard's own display goal (AC #1, #2) is fully
met; the "launch into deeper workflow" half of AC #3 was unspecified prior to
this review (now resolved, see C-020) and two accessibility gaps below block
full task completion specifically for assistive-technology users.
Structural Consistency: 9/10 — terminology ("Queue", "Awaiting review",
"Triage level", "Consultation") and the nav model match
`product-architecture.md` exactly throughout.
Efficiency: 8/10 — one-click launch points, overflow top-N pattern avoids
scrolling at any queue volume, counts inline rather than requiring a click to
discover.
Learnability: 8/10 — personalized greeting, plain widget titles, no jargon
requiring system knowledge to parse.
Navigation: 8/10 — single-screen feature, no drill-down state to lose yet;
persistent sidebar orients the user at all times.
Discoverability: 7/10 — primary actions (rows, buttons) are visible without
exploration; the nine disabled nav items give no signal of what's coming,
addressed as a Major finding.
Error Prevention: 7/10 — each widget fails independently with a clear inline
banner; the "End consultation" action has no stated double-submission guard.
Error Recovery: 6/10 — widget-level load failures recover cleanly via an
inline Retry link; the optimistic "End consultation" action has no specified
failure/rollback path, a real gap given the clinical stakes.
Feedback: 8/10 — toast confirms consultation end using the same verb as the
action; skeletons match real content dimensions with no layout shift; the
Live signal itself is visual-only (see Accessibility).
Cognitive Load: 9/10 — three widgets, no competing primary actions, counts
surfaced inline rather than requiring a separate glance.
Trust: 8/10 — empty/error copy states what's true and offers a next action
without blaming the user; no alarming language anywhere.
Accessibility: 4/10 — focus order and focus-visible rings are fully specified
and, per `design-review.md`, verified working; but two Critical gaps mean a
screen-reader-using doctor cannot perceive the queue's live-update signal or
distinguish an abnormal result from a normal one — both are the specific
clinical information these widgets exist to carry.
Edge Case Handling: 8/10 — empty, loading, error, 40+ stress, and the exact
top-N boundary are all genuinely demonstrated in the prototype, not merely
described.

Overall: 74/100

## Critical

[Critical] Live queue updates carry no non-visual signal — screen-reader users cannot tell when a new patient arrives
Location: `design-spec.md` Motion section and QueueRow States;
`prototype/index.html` `#queue-body` (no `aria-live` region present);
`art-direction.md` "Signature element" (the Live indicator)
Observed: A new queue arrival is communicated entirely through a visual
slide-in + colour highlight-fade plus a pulsing "Live" dot. Nothing in
`design-spec.md` or the rendered markup announces the change to assistive
technology — `#queue-body` carries no `aria-live` attribute, and no
screen-reader-only text equivalent of "new patient added" exists anywhere in
the spec or prototype.
Consequence: The one piece of information this entire feature is designed
around — "is this queue current right now, and did anything just change" —
is invisible to a screen-reader-using doctor. A sighted colleague sees a
critical-triage patient displace a routine row instantly; a screen-reader
user learns of it only by chance, on the next full re-read of the list. In a
live clinical queue ordered by triage urgency, that delay is a safety-
relevant gap, not a cosmetic one.
Required: Specify a polite `aria-live` region (or equivalent screen-reader-
only announcement) that fires when a row enters the queue, stating at
minimum the patient's name and triage level for an urgent/critical arrival.
Add this to `design-spec.md`'s Motion section or a new Accessibility
subsection, for `frontend-architect`/`staff-ui-engineer` to implement.

[Critical] The abnormal/flagged indicator on a pending result has no accessible text equivalent
Location: `design-spec.md` PendingResultRow section; `prototype/index.html`
`renderResultRows()` — the `flag-icon` SVG has no `aria-label`, `title`, or
visually-hidden text, and carries no equivalent marker when absent
Observed: A flagged/abnormal result is distinguished from a normal one purely
by the presence of a small icon — present when flagged, entirely absent
(not greyed out) when normal, per the spec's own description. The icon
itself has no accessible name.
Consequence: A screen-reader user reading a pending-result row hears only the
patient name and test type in every case — there is no way to tell an
abnormal result needing urgent sign-off apart from a routine one. This is
precisely the information C-008 scoped this widget to surface ("completed
results awaiting doctor sign-off"), and it is the one distinguishing fact a
doctor cannot afford to miss.
Required: Give the flag icon an accessible name (e.g. `aria-label="Abnormal
result"` or adjacent visually-hidden text) so its presence is announced, and
ensure a normal result is not conveyed solely by the icon's absence —
distinguish flagged vs. normal as an explicit, always-present accessible
property rather than one implied by an element existing or not.

## Major

[Major] No destination was specified for an individual row/card click, despite AC #3 requiring one
Location: `design-spec.md` (QueueRow, PendingResultRow, CurrentConsultationCard
sections describe hover/focus visuals but no click/navigation behaviour);
`product-architecture.md` IA table (Patient chart, Consultation view, Result
detail all marked "future feature")
Observed: The prototype's rows and "Open chart" button do nothing when
clicked, and `design-spec.md` never states an intended route — only the two
overflow-footer links get partial route treatment (and even one of those,
result detail, is explicitly flagged "route not yet defined").
Consequence: Left unspecified into stage 4, the dashboard's primary
interaction — the one-click launch AC #3 requires — could ship as a dead
click into pages that don't exist yet, directly contradicting the AC's own
"rather than a dead-end summary."
Required: Resolved by clarification during this review — see C-020 /
`D-role-dashboard-shell-8`. Every row/card click must resolve to a real route
per `product-architecture.md`'s URL patterns, even into a not-yet-built
destination. Assigned to `frontend-architect` (stage 4) to define the routes
and what renders at each in the interim.

[Major] Disabled nav items give no feedback, reading as broken rather than not-yet-built
Location: `prototype/index.html` sidebar nav (`<button class="nav-item"
disabled>` × 9); `design-spec.md` has no affordance spec for this state
Observed: Nine of the ten sidebar destinations are visible, fully disabled,
and give no hover/click feedback of any kind.
Consequence: A doctor unfamiliar with the rollout schedule — a reasonable
case given `project-context.md`'s "wide range of general software literacy"
— has no way to tell these are intentionally unbuilt rather than broken,
confirmed as an unaddressed gap via C-021.
Required: Add a minimal affordance (e.g. a "Coming soon" tooltip on hover)
per C-021. Assigned to `staff-ui-engineer` (stage 5).

[Major] The optimistic "End consultation" action has no specified failure or double-submission handling
Location: `design-spec.md` CurrentConsultationCard section ("'End
consultation' completes immediately on click (optimistic)... A brief toast...
confirms the action landed.")
Observed: The spec describes only the success path. Nothing states what
happens if the underlying request fails after the doctor has already moved
on believing the consultation ended, and nothing states whether the button
disables or debounces against a rapid second click before the first
resolves.
Consequence: A silent optimistic-update failure in a clinical workflow risks
a doctor believing a consultation is closed — and moving to the next patient
— when the server never recorded it. This is an unhandled error path with
real clinical-record consequences if left unresolved before implementation.
Required: Specify the rollback/error path (e.g. reopen the card with an
inline error and an explicit retry, rather than silently reverting with no
explanation) and whether the button becomes disabled or shows a committed
state to prevent a second click before the first resolves. Assigned to
`frontend-architect` (stage 4), since this builds on the fixture-backed data
layer's request/state design.

## Strengths

The state coverage is genuinely thorough, not merely claimed: empty,
loading, error, 40+ stress, and the exact top-N boundary are all real,
distinct, inspectable states in the prototype, which is exactly what let this
review test edge cases directly rather than take them on faith. Terminology
discipline against `product-architecture.md` is exact throughout — no
"appointment" where "consultation" was meant, no "insurance" where "HMO
coverage" was meant. The widget-level independent error handling (each
widget fails and retries on its own, confirmed in `NOTES.md` and the Error
proto-bar state) is the right shape for a dashboard assembling data from
several sources. The density and grouping keep cognitive load genuinely low
for a daily-use, extended-hours tool — three widgets, no competing primary
actions, counts inline rather than requiring a click to discover.

## Cross-Cutting Notes
None outside remit for this review — the font-weight substitution flagged by
`design-reviewer` is that reviewer's remit, not repeated here.

## Reopen Requests
None. `D-role-dashboard-shell-1` through `-7` all stand as settled.

## Required Changes for Next Stage
N/A — verdict is REJECTED. All Critical and Major findings above return to
`senior-product-designer` (stage 1) to resolve in `design-spec.md` (and the
prototype, where the fix is demonstrable there) before this feature is
re-reviewed.
