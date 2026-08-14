# Clarifications

Append-only record of every question asked of the user and every answer given,
for this feature. Written by whichever specialist asked.

This file exists because answers given in conversation are destroyed by the next
`/clear`. Without it, each stage re-asks what the previous stage already resolved,
and a decision that came from the user becomes indistinguishable from one a
specialist invented.

Before asking anything, read this file. If the question has already been answered,
it is answered.

Record the answer as given. If the user delegated the choice, record that
explicitly, along with the choice made and why — a delegated decision and a
specified one carry different weight later.

---

## C-001
Asked by: artifact-manager (stage 0)
Date: 2026-07-26
Question: Which role(s) should this first dashboard feature cover?
Options offered: Doctor, Nurse, Receptionist, Hospital admin/CMO (multi-select, no
recommendation given — all four are real roles in `project-context.md`).
Answer: Doctor, Nurse, Receptionist, Hospital admin/CMO (all four selected as roles
in view long-term).
Type: specified
Consequence: All four roles are in scope for the eventual dashboard effort, but not
all in this one feature — see C-002.
Decision ID: none

## C-002
Asked by: artifact-manager (stage 0)
Date: 2026-07-26
Question: How should the multi-role nature of "dashboard" be scoped as a single
feature?
Options offered: (a) one shared dashboard shell + one role's content — recommended,
(b) one dashboard per role, all in this feature, (c) just the shared shell/pattern,
no role content yet.
Answer: (a) One shared dashboard shell + one role's content.
Type: specified
Consequence: This feature builds a reusable dashboard shell/layout pattern plus full
content for exactly one role. Nurse, Receptionist, and Hospital admin/CMO dashboard
content become separate future features reusing the shell.
Decision ID: none

## C-003
Asked by: artifact-manager (stage 0)
Date: 2026-07-26
Question: You picked a shared shell + one role's content, but selected 4 roles
overall — which role should get full content in this first feature?
Options offered: Doctor, Nurse, Receptionist, Hospital admin/CMO.
Answer: Doctor.
Type: specified
Consequence: `current-feature.md` scopes full dashboard content to Doctor; the shell
is documented for reuse by the other three roles later.
Decision ID: none

## C-004
Asked by: artifact-manager (stage 0)
Date: 2026-07-26
Question: What does "done" look like for this first dashboard feature — what
should the acceptance criteria emphasize?
Options offered: at-a-glance status, quick navigation, role-specific metrics, or
"not sure yet — let senior-product-designer propose it" (multi-select).
Answer: At-a-glance status, quick navigation, role-specific metrics, and "not sure
yet — let senior-product-designer propose it" all selected together.
Type: delegated
Consequence: `current-feature.md`'s acceptance criteria were drafted by
artifact-manager covering the three named themes (at-a-glance status, launch-point
navigation, role-relevant metrics), but `senior-product-designer` retains latitude
at stage 1 to refine or add criteria beyond what's stated here — the user
explicitly did not want to lock this down further at stage 0.
Decision ID: none

---

## C-005
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Round 1 restatement of every requirement, goal, constraint and scope
boundary extracted from `current-feature.md` and `project-context.md` (feature
definition, user goal, AC's, priority order, user profile, out-of-scope items,
open visual/brand latitude, open role-routing assumption), presented as a
numbered list for confirmation.
Answer: No corrections raised. Proceeded to Round 2 gap questions.
Type: specified (confirmed by absence of correction)
Consequence: All eight restated points stand as read.
Decision ID: none

## C-006
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Typical/maximum number of patients in a doctor's active queue at once —
needed to satisfy the "no scrolling" acceptance criterion.
Options offered: Small (≤8), Moderate (9-20), Large (20+), Varies too much for a
hard cap — no recommendation given, no basis in the artifacts.
Answer: Varies too much to design for a hard cap.
Type: specified
Consequence: Triggered follow-up C-007 on overflow handling.
Decision ID: none

## C-007
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: How should the dashboard handle a queue too long to fit on one screen?
Options offered: fixed top-N with count + link to full queue (recommended),
compact/shrinking rows with no cap, scrollable-within-widget.
Answer: Show a fixed top-N.
Type: specified
Consequence: Queue widget shows a fixed number of next patients (by triage/wait
order) plus an overflow count and a launch point into the full queue view. See
D-role-dashboard-shell-4.
Decision ID: D-role-dashboard-shell-4

## C-008
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: What does "pending lab/results to review" mean?
Options offered: completed results awaiting doctor sign-off (recommended),
ordered-but-not-completed, both combined.
Answer: Completed results awaiting doctor sign-off.
Type: specified
Consequence: Pending Results widget shows only completed results awaiting the
doctor's review, not lab-side order tracking.
Decision ID: none

## C-009
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Can a doctor have more than one consultation in progress at once?
Options offered: exactly one at a time (recommended), multiple simultaneous.
Answer: Exactly one at a time.
Type: specified
Consequence: "Consultations in progress" is modelled as a single current
consultation, not a list. Directly informed C-017.
Decision ID: none

## C-010
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Should the dashboard update live or only refresh on load/manual action?
Options offered: live/real-time (recommended), refresh on load/manual only.
Answer: Live/real-time.
Type: specified
Consequence: Frontend-architect must design a polling/streaming mechanism at
stage 4; the prototype and design-system carry a live-update motion signature
(row slide-in + highlight-fade) and a "Live" indicator. See
D-role-dashboard-shell-3.
Decision ID: D-role-dashboard-shell-3

## C-011
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: What overall density should the dashboard commit to?
Options offered: dense (~32-36px control height, recommended), comfortable
(40-44px).
Answer: Dense (compact rows/cards, ~32-36px control height).
Type: specified
Consequence: Locked into `art-direction.md` Density section and
`design-system.md` spacing/control tokens. See D-role-dashboard-shell-2.
Decision ID: D-role-dashboard-shell-2

## C-012
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: What should the app-wide navigation model be?
Options offered: persistent left sidebar (recommended), top nav with dropdowns,
minimal/command-driven.
Answer: Persistent left sidebar, icon+label destinations.
Type: specified
Consequence: Becomes `product-architecture.md`'s navigation model, binding on
every future feature. See D-role-dashboard-shell-1.
Decision ID: D-role-dashboard-shell-1

## C-013
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Does an individual staff account ever span more than one hospital
branch, needing a switcher in the shell header?
Options offered: one hospital per account (recommended), multi-hospital with
switcher.
Answer: One hospital per account.
Type: specified
Consequence: Shell header/sidebar carries no hospital-switcher for this feature.
Revisit if a future feature surfaces cross-branch staff. See
D-role-dashboard-shell-5.
Decision ID: D-role-dashboard-shell-5

## C-014
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Confirm the current-feature.md assumption that role-based auth/routing
already exists and lands a doctor on their dashboard route without this feature
designing it.
Options offered: confirmed — assume it exists (recommended), not confirmed —
this feature must also address it.
Answer: Confirmed — assume it exists.
Type: specified
Consequence: This feature designs only what renders once the doctor is on their
dashboard route. `frontend-architect` verifies the actual routing at stage 4.
Decision ID: none

## C-015
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: What are the real top-level destinations for app-wide navigation,
beyond Dashboard?
Options offered (multiselect): Patients/Records, Queue/Appointments,
Consultations, "Billing/Claims, Lab, Pharmacy, Inventory, Staffing, Reports"
(bundled option).
Answer: All of the above selected — Patients/Records, Queue/Appointments,
Consultations, Billing/Claims, Lab, Pharmacy, Inventory, Staffing, Reports.
Type: specified
Consequence: `product-architecture.md`'s navigation model lists ten top-level
destinations (including Dashboard). Only Dashboard is built in this feature; the
rest are placeholders reserved for their own future features.
Decision ID: none

## C-016
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Should the reusable shell include placeholders for global shared
surfaces (notifications, global search, user/account menu) now?
Options offered (multiselect): user/account menu (recommended), global search,
notifications bell, none yet.
Answer: User/account menu, global search, and notifications bell all selected.
Type: specified
Consequence: All three are part of the shell's header/sidebar chrome from this
feature onward, documented in `product-architecture.md`'s Shared surfaces
section, functionally inert placeholders where no feature yet populates them
(e.g. notifications bell shows a zero state).
Decision ID: none

## C-017
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Given exactly one active consultation at a time, is it a separate
widget or a status folded into the queue widget?
Options offered: separate "current consultation" widget (recommended), folded
into queue as a status.
Answer: Separate "current consultation" widget.
Type: specified
Consequence: Dashboard has three widgets: Queue, Current Consultation, Pending
Results — matching the AC's phrasing exactly.
Decision ID: none

## C-018
Asked by: senior-product-designer (stage 1)
Date: 2026-07-26
Question: Which fields matter for each of the three widgets (queue entry,
current consultation, pending result)?
Options offered (multiselect per widget): see individual field options offered
in session.
Answer: Queue entry — patient name, wait time, triage/priority level (chief
complaint explicitly not selected). Current consultation — patient name, elapsed
time, quick actions: open chart, end consultation (room/bay not selected).
Pending result — patient name, test/result type, abnormal/flagged indicator
(date/time available not selected).
Type: specified
Consequence: `design-spec.md` widget specs are scoped to exactly these fields;
no chief-complaint text, no room/bay field, no "waiting since" timestamp on
results.
Decision ID: none

---

## C-019
Asked by: ux-reviewer (stage 3)
Date: 2026-07-26
Question: Round 1 restatement of the reviewed audience/context — daily,
extended-hours doctor users with variable general software literacy; desktop
1280-1920px workstation, verified to 640px, mobile/tablet out of scope; success
defined as immediate at-a-glance status plus one-click launch into deeper
workflow; frequent/recurring visits (favours positional stability over
first-time discoverability); "End consultation" optimistic-completion friction
already confirmed deliberate elsewhere — presented as a numbered list for
confirmation.
Answer: Confirmed as stated, no corrections.
Type: specified (confirmed)
Consequence: All five restated points stand as the review's standard.
Decision ID: none

## C-020
Asked by: ux-reviewer (stage 3)
Date: 2026-07-26
Question: AC #3 requires every dashboard row/card to be a direct launch point
into the patient chart, consultation view, or result detail — but
`product-architecture.md`'s IA table marks all three destinations as future
features, not yet built, and neither `design-spec.md` nor the prototype states
what a Queue row / Result row / "Open chart" click should do right now (only
the two overflow-footer links get partial routes). What should happen on
click today?
Options offered: navigate to a real (if unbuilt) route, e.g. `/patients/:id`,
so the destination exists structurally even before its own feature ships
(recommended); leave inert until the target feature ships; something else.
Answer: Navigate to a real (if unbuilt) route.
Type: specified
Consequence: Every row/card click (QueueRow, PendingResultRow, "Open chart")
must resolve to a real route per `product-architecture.md`'s URL patterns
(e.g. `/patients/:patientId`), even though the destination page itself is a
future feature. `frontend-architect` (stage 4) is responsible for defining
these routes and what renders at them in the interim (a stub/placeholder
page, not a 404 or dead click). See D-role-dashboard-shell-8.
Decision ID: D-role-dashboard-shell-8

## C-021
Asked by: ux-reviewer (stage 3)
Date: 2026-07-26
Question: The nine disabled nav items (Patients, Lab, Billing & Claims, etc.)
give zero feedback on hover or click in the prototype. Is that the intended
production behaviour, or is some minimal affordance expected?
Options offered: add a lightweight "Coming soon" tooltip affordance
(recommended); leave fully inert as prototyped; something else.
Answer: Add a lightweight affordance.
Type: specified
Consequence: Disabled nav items must surface some minimal feedback (e.g. a
"Coming soon" tooltip on hover) rather than reading as dead/broken controls.
Required Change assigned to `staff-ui-engineer` (stage 5) — see this review's
Major findings.
Decision ID: none

## C-022
Asked by: ux-reviewer (stage 3)
Date: 2026-07-26
Question: Global search and the notifications bell currently do nothing when
clicked, with no visual indication they're inert. Deliberate placeholder
behaviour for this feature, or should they show a minimal "not available yet"
state?
Options offered: deliberate, fully inert for now, matching
`product-architecture.md`'s "functionally inert placeholders" framing
(recommended); add a minimal not-available state; something else.
Answer: Deliberate, fully inert for now.
Type: specified
Consequence: No change required — search and notifications stay exactly as
prototyped for this feature.
Decision ID: none
