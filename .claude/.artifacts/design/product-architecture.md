# Product Architecture

Project-level and structural, the counterpart to `art-direction.md`. Authored by
`senior-product-designer` during the first feature, then extended and conformed to.

## Why this exists

The pipeline gates one feature at a time. Every feature can pass all four gates and
the product can still be incoherent, because no gate looks across features.

That incoherence is what makes software feel assembled rather than designed: three
words for the same object, four navigation patterns, a URL scheme that changes shape
per section. Visual consistency cannot rescue structural inconsistency — it makes it
more conspicuous.

Every feature checks itself against this document. Changing it is a decision, not
an edit.

## Navigation model

A single persistent left sidebar, collapsible to icon-only, present on every
authenticated screen. See `D-role-dashboard-shell-1`.

Top-level destinations, in order: Dashboard, Patients, Queue & Appointments,
Consultations, Lab, Pharmacy, Billing & Claims, Inventory, Staffing, Reports.
Only **Dashboard** is built as of this feature; the rest are reserved slots for
their own future features and must not be built ahead of their turn.

Sidebar footer: the user/account menu (avatar, staff name, role, hospital name,
sign out) — identity stays anchored in the nav, not the header, because it does
not change per page the way search/notifications do.

Header (top bar, present on every page): page title/breadcrumb on the left,
global search and the notifications bell on the right. These are transient,
page-independent actions, which is why they live in the header rather than the
sidebar.

Reachable in one action from anywhere: global search (patient lookup),
notifications, the user menu, and every top-level sidebar destination.

Rule for adding a top-level destination: a new item may be added only if it is a
distinct object/domain staff navigate to directly across multiple workflows —
not a sub-view or filtered state of an existing destination (e.g. "Vitals" does
not get one; it is reached through Consultations). Adding one requires user
confirmation and a decision-log entry, never a stage-1 judgement call made in
passing.

## Information architecture

| Object | Contains | Reached from | Primary view |
|---|---|---|---|
| Hospital | Staff, Patients, Queue, Inventory, Rosters | User menu (current hospital name) | — (no cross-hospital view; one hospital per account, `D-role-dashboard-shell-5`) |
| Patient | Episodes, Consultations, Lab orders/results, Prescriptions, Invoices/Claims | Global search, Patients, a Queue entry | Patient chart (future feature) |
| Queue entry | — (a status/position on a Patient for today) | Dashboard queue widget, Queue & Appointments | Queue & Appointments list (future feature) |
| Consultation | Vitals, notes, orders placed | Dashboard current-consultation widget, a Patient's chart | Consultation view (future feature) |
| Lab result | — (belongs to a Consultation's orders) | Dashboard pending-results widget, a Patient's chart | Result detail (future feature) |

This table will grow as each future feature designs its own objects (Billing/
Claims, Inventory, Staffing) — add rows, do not restructure existing ones
without a decision entry.

## URL structure

Patterns only, not an exhaustive list. `frontend-architect` conforms real
routes to these at stage 4.

| Pattern | Shape | Example |
|---|---|---|
| Collection | `/{plural-resource}` | `/patients` |
| Detail | `/{plural-resource}/:id` | `/patients/:patientId` |
| Nested resource | `/{plural-resource}/:id/{sub-resource}/:subId` | `/patients/:patientId/consultations/:consultationId` |
| Filtered collection | `/{plural-resource}?{filter}={value}` | `/queue?status=waiting` |
| Root/home | `/dashboard` | `/dashboard` (role-scoped; role resolved upstream of this route per `D-` in `current-feature.md`'s assumption, confirmed C-014) |

State that belongs in the URL by default: any filter, sort or tab a user would
expect to survive a page refresh or be shareable via link (e.g. `?status=`).
Ephemeral UI state (a hover, an open dropdown) never goes in the URL.

## Terminology

| Use | Never | Means |
|---|---|---|
| Queue | Waiting list, line | Today's live list of checked-in patients waiting for or currently in a consultation |
| Checked in | Arrived, registered | A patient's status once logged into today's queue |
| Consultation | Visit, appointment (see below) | The in-progress or completed clinical encounter itself |
| Appointment | Visit, booking | A scheduled future slot, distinct from a consultation (which is today, live, in the queue) |
| Triage level | Priority, urgency | The clinical urgency ranking assigned at check-in that orders the queue |
| Chart | Record, profile, file | A patient's clinical file/history |
| Awaiting review | Unread, pending, new | A completed result the doctor has not yet signed off on |
| HMO coverage | Insurance | Carried over from `project-context.md`'s existing domain vocabulary |
| Patient | Client, customer | Carried over from `project-context.md` |

## Shared surfaces

- **Global search** (header, every page): patient lookup by name/ID. Any
  feature that wants a new searchable entity type extends the same search
  surface — it does not spin up a second, feature-local search box.
- **Notifications bell** (header, every page): system-level alerts distinct
  from any one dashboard widget (e.g. a future "critical result" alert type).
  Currently a placeholder with a zero state — no feature populates it yet.
- **User/account menu** (sidebar footer, every page): profile, hospital name,
  sign out.

Any feature adding a new notification type, search-result category, or user-menu
item goes through a decision-log entry, since it changes a surface every other
feature also depends on.

## Cross-feature patterns

| Pattern | Decision | Decision ID |
|---|---|---|
| How detail views open | Full navigation (its own URL) for anything with real depth (a patient chart, a consultation) — never a modal. Modals are reserved for quick actions/confirmations of a few fields. | — |
| How destructive actions are confirmed | A confirmation dialog whose confirm button repeats the action's verb (e.g. "Discard changes", not "Confirm"). Reserved for actions that lose data or are hard to reverse — a frequent, routine completion action (e.g. ending a consultation) is not destructive and must not be gated behind a dialog. | — |
| How live/real-time data changes | New/changed rows animate in with the slide-in + accent highlight-fade from `art-direction.md`'s motion signature — never an abrupt re-sort or jump. | D-role-dashboard-shell-3 |
| How errors surface | Inline, near the failing widget/action, in the interface's voice — never "something went wrong". | — |
| How long-running work reports progress | Not yet decided — no feature has needed it. The first feature that does defines it here. | — |

## Change log

| Date | Change | Feature | Decision ID |
|---|---|---|---|
| 2026-07-26 | Authored navigation model, IA, URL patterns, terminology, shared surfaces and cross-feature patterns from scratch (first feature in the pipeline) | role-dashboard-shell | D-role-dashboard-shell-1, -3, -5 |
