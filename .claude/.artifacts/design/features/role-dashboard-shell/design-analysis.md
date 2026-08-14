# Design Analysis

Written before the specification. Grounds every downstream choice in the
clarified requirements — see `clarifications.md` C-001 through C-018.

## The user's actual goal and the shortest path to it

A doctor opens the app between patients. Their goal is not "see a dashboard" —
it is "know who's next, what I'm mid-way through, and what's waiting on my
sign-off, in the time it takes to glance at a screen." The shortest path is
zero clicks to see it and one click to act on it. That is the whole brief:
this screen is a launch pad, not a report.

## Who they are, how often, how expert

Per `project-context.md`: daily, extended-hours use, expert in clinical
domain, wide range of general software literacy. This rules out anything
that needs to be learned (a customizable widget layout, a settings step
before first use) and rules in dense-but-legible over sparse-but-safe. Per
C-011, density target is committed at ~32-36px, not the comfortable 40-44px
range, because the audience trades comfort for speed once they're past their
first few sessions — and first-session friction is mitigated by the empty/
loading states carrying real explanatory text rather than by inflating every
control.

## Information architecture fit

Three widgets map 1:1 onto the three counts named in the acceptance criteria
and onto three distinct objects in `product-architecture.md`'s IA table: Queue
entry, Consultation, Lab result. None of the three widgets is a summary of the
others — each is a distinct object class with its own future full-page view
(Queue & Appointments, Consultations, and a result detail reached from a
Patient's chart). The dashboard's job is to surface the actionable subset of
each, not to duplicate their eventual full views.

## Primary action

There are three primary actions, one per widget, because a doctor's attention
naturally splits across three different current concerns — this is not a
single-CTA screen:
- Queue widget → open a queue entry (opens that patient's chart/queue detail).
- Current consultation widget → "Open chart" (continue) or "End consultation"
  (complete) — the only two verbs a doctor needs mid-consultation.
- Awaiting review widget → open a result to review it.

Layout makes each obvious by making every row/card in all three widgets a
full-width click target with a visible hover/focus affordance, rather than a
small icon-button tucked at the row's edge.

## What breaks at scale

- **Long queue (C-006/C-007)**: no hard cap exists. Handled by a fixed top-N
  (6, ordered by triage level then wait time) plus an overflow count and a
  link into the full queue. Six is chosen because it's the largest count that
  still fits three widgets on a 1280px-wide viewport at the 36px row height
  without scrolling — verified in the layout grid below.
- **Empty queue**: not an edge case here, a routine state (start of shift, lull
  between patients) — gets a real empty state, not a suppressed widget.
- **No current consultation**: routine, same treatment — the widget explains
  what will appear there once the doctor starts one from the queue.
- **Long patient names**: Nigerian clinical names can run long (compound
  surnames, honorifics recorded in some HMO paperwork). Rows truncate with
  ellipsis and the full name is available via the row's focus/hover title and
  on the destination page — never wrapped to a second line, which would break
  the fixed row height the no-scroll guarantee depends on.
- **Simultaneous live updates**: a queue entry could complete just as a new one
  arrives. Each row's slide-in/highlight-fade is independent per-row, not a
  full-widget re-render, so overlapping changes don't visually collide or
  reset scroll/focus position.
- **Network/data failure**: each widget fails independently (one widget's
  error does not blank the other two) — a doctor can still act on whichever
  data did load.

## Component reuse vs. new components

Existing system: none — this is the first feature, so every component listed
in `design-system.md`'s Components table is new. All ten are justified as
primitives that a second dashboard (Nurse, Receptionist, CMO) will reuse
directly: Sidebar and Header are the shell itself; WidgetCard, LiveIndicator,
EmptyState, SkeletonRow and ErrorBanner are role-agnostic containers/states;
QueueRow, TriageChip, CurrentConsultationCard and PendingResultRow are
Doctor-specific content components that other roles will need their own
equivalents of, but establish the interaction pattern (row = full-width
launch point, chip = colour+label status) the other roles' widgets will copy.

## Shell vs. content boundary

Per the AC's explicit requirement to document this split: the **shell** is
Sidebar, Header, and the widget-grid layout container (a responsive grid that
lays out N widget slots — width, gap, and column behavior are shell-owned).
The **Doctor content** is everything inside the three widget slots:
QueueRow/TriageChip, CurrentConsultationCard, PendingResultRow, and the counts
in each widget's header. A future Nurse dashboard reuses the shell and the
grid unchanged, and fills the same slots with Nurse-specific components.
