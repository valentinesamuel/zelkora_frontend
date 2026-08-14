# Current Feature

The active work item. Authored at stage 0 by `artifact-manager`. The acceptance
criteria are the standard `ux-reviewer` reviews against, so they must be observable
rather than aspirational.

## Feature

Role dashboard shell — a reusable staff dashboard layout and widget framework,
fully realized with Doctor content as the first instance. Lets staff land on a
role-appropriate home screen that shows what needs their attention right now and
launches them straight into the relevant deeper workflow.

## User goal

As a doctor, I want to see my current patient queue, pending consultations, and
outstanding results the moment I open the app, so I can start working without
hunting through menus.

## Acceptance criteria

Observable and testable.

- [ ] A doctor landing on the dashboard sees their current queue (patients waiting,
      in consultation) within one screen, no scrolling required, within seconds of
      the page loading.
- [ ] The dashboard surfaces role-relevant counts for a doctor: patients waiting,
      consultations in progress, pending lab/results to review.
- [ ] Every item on the dashboard (a queue entry, a pending result, a metric card)
      is a direct launch point — one click/tap opens the corresponding deeper
      workflow (patient record, consultation view, result detail) rather than a
      dead-end summary.
- [ ] The dashboard layout (header, navigation-in, widget grid) is documented as a
      reusable shell — distinct from the Doctor-specific widget content — so that a
      future Nurse, Receptionist, or Hospital admin/CMO dashboard can adopt the same
      shell without re-deriving layout decisions.
- [ ] The shell and Doctor content are both usable at common desktop viewport sizes
      used in hospital workstations (this feature does not need to solve mobile/
      tablet layouts unless `senior-product-designer` finds it trivial to do so).

## Scope

In: A reusable dashboard shell (page layout, header, widget grid pattern) and full
Doctor-role dashboard content (queue, consultations in progress, pending results,
quick navigation into each). Documentation of the shell as a pattern other roles
will adopt later.

Out: Nurse, Receptionist, and Hospital admin/CMO dashboard *content* — tracked as
separate future features that will reuse this shell, not built now. The
patient-facing portal (out of scope for the whole pipeline per `project-context.md`).
Mobile/tablet-optimized layouts, unless trivially covered by the desktop-first
approach. Backend API implementation — this feature designs against the
fixture-backed data layer per `.claude/knowledge/stack.md`; the real contract is
`frontend-architect`'s job at stage 4 (`api-contract.md`).

## Priorities

1. Shell reusability — the layout/widget pattern must generalize cleanly to other
   roles, since that is the whole point of building it first.
2. Doctor content correctness — the queue/consultation/results widgets must reflect
   real clinical workflow needs, not placeholder metrics.
3. Breadth (covering other roles) is explicitly deprioritized to a later feature.

## Assumptions

- Role-based routing/authentication already distinguishes staff roles enough to
  route a doctor to a doctor-specific dashboard instance. This is not designed here
  — to be confirmed or derived by `senior-product-designer` at stage 1 or
  `frontend-architect` at stage 4, not invented in this file.
- Domain vocabulary (queue, consultation, vitals, etc.) carries over from
  `project-context.md`'s "Domain vocabulary" section as a starting point, subject to
  confirmation/expansion at stage 1.
- No existing art direction or product architecture exists yet — `art-direction.md`
  and `product-architecture.md` are still unfilled templates. `senior-product-designer`
  must author both as part of stage 1 for this first feature, before producing any
  prototype.

## Known constraints

- Nigerian healthcare compliance (NDPR, HMO/claims conventions, audit-log retention)
  applies where relevant — not expected to be load-bearing for a dashboard-only
  feature, but any patient-identifying data shown on the dashboard should be treated
  with the same care as elsewhere in the system.
- Existing `../clinic-flow` codebase is reference-only, not to be ported directly —
  this is a from-scratch visual/UX redesign.
- No deadline stated for this feature.
