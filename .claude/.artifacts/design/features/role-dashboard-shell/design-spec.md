# Design Spec — Role Dashboard Shell (Doctor instance)

Values, not adjectives. Every number below is a token from `design-system.md`
unless stated otherwise.

## Layout and grid

Primary target: desktop workstation, 1280–1920px, designed at 1440px.

- **Sidebar**: 220px wide expanded, 64px collapsed. Fixed left, full height.
  Collapse toggle at the bottom, above the user menu.
- **Header**: 56px tall, fixed top, spans the remaining width right of the
  sidebar. Contents: page title (text-lg, left, 24px from sidebar edge),
  global search trigger (240px wide input-like button, right-aligned before
  the bell), notifications bell (32px control, badge dot top-right if unread —
  unused/zero this feature), 24px gap, then the header ends (user menu lives
  in the sidebar footer, not here — see `product-architecture.md`).
- **Content area**: starts 24px (space-6) below the header, 24px left/right
  page padding.
- **Widget grid**: two columns, `2fr 1fr`, `gap: 24px` (space-6) — not three
  equal columns. Queue is the dominant region (it carries the most rows and
  the highest-priority workflow per `current-feature.md`'s priority order);
  Current Consultation and Awaiting Review stack in the narrower right column
  with the same 24px gap between them. Each widget is a `WidgetCard` with
  `radius-none`, 1px `color-border`, `color-surface` background,
  `padding: 16px` (space-4).
- Below 1024px (bp-lg): grid collapses to 1 column, widgets stack in the order
  Queue → Current Consultation → Awaiting Review (priority order from
  `current-feature.md`). Verified down to 640px (bp-sm) — the narrowest
  breakpoint token this feature commits to — with no horizontal scroll and no
  layout collision; the header title truncates with ellipsis rather than
  wrapping into the search trigger below its natural width. Widths narrower
  than bp-sm (phone-class viewports) are unverified and explicitly out of
  scope per the AC's mobile/tablet allowance — no sidebar or header behaviour
  is specified below 640px, and none should be assumed.

### Widget internal structure (all three widgets)

- Header row: `text-md` weight 500 title, left; inline count in `text-sm`
  `color-text-muted` immediately after the title (e.g. "Queue · 9 waiting");
  height 32px (control height), bottom border 1px `color-border` at 16px
  below.
- Content: rows/card, `padding-top: 12px` (space-3) below the header border.
- Footer (Queue and Awaiting Review only, when overflow exists): a text link,
  32px tall, `text-sm`, `color-accent`.

## Component specs

### QueueRow

- Height: 36px, full-width click target, `padding: 0 12px` (space-3).
- Layout: `TriageChip` (left, fixed 64px), patient name (`text-base`,
  `color-text-strong`, truncates with ellipsis, flexes to fill), wait time
  (`text-sm` `font-mono` tabular, `color-text-muted`, right-aligned, fixed
  56px, format `mm'` or `hh'mm"` past 60 minutes).
- States: default (`color-surface`), hover (`color-surface-raised`),
  focus-visible (2px `color-accent` ring, 2px offset), entering (per motion
  signature: slide in from `translateY(-8px)` + `opacity 0`→`1` over 220ms,
  background `color-accent-muted`→`color-surface` over 600ms).
- Order: triage level (critical → urgent → routine), then wait time ascending
  within the same level.
- Top-N shown: 6. Beyond 6, footer reads "+{n} more waiting · View full queue"
  linking to `/queue?status=waiting`.

### TriageChip

- 64px × 24px, `radius-sm`, `text-xs` uppercase, +0.02em tracking, centered.
- Variants: `routine` (neutral: `color-surface-raised` bg, `color-text-body`
  text), `urgent` (`color-warning` bg at 16% opacity, `color-warning` text +
  a small triangle icon — never colour alone per `craft.md`), `critical`
  (`color-danger` bg at 16% opacity, `color-danger` text + a filled circle
  icon).

### CurrentConsultationCard

- Two states: **active** and **empty** (no consultation in progress —
  routine, not an error).
- Active layout: patient name (`text-md` weight 500) + elapsed time
  (`text-sm` `font-mono`, updates live, format `mm:ss` under 60 min then
  `h:mm`) on one row; two buttons below, `height: 32px` each, full-width
  split 50/50 with 8px gap: "Open chart" (secondary style — border, no fill)
  and "End consultation" (primary style — `color-accent` fill, white text).
- "End consultation" completes immediately on click (optimistic) — it is a
  routine, high-frequency completion action, not a destructive one, so it is
  not gated behind a confirmation dialog per `product-architecture.md`'s
  cross-feature pattern. A brief toast ("Consultation ended") confirms the
  action landed.
- Empty state: see States section below.

### PendingResultRow

- Height: 36px, full-width click target, `padding: 0 12px`.
- Layout: abnormal-flag icon (left, 16px, `color-danger`, present only when
  flagged — absent, not greyed-out, when normal), patient name (`text-base`,
  flexes), test/result type (`text-sm` `color-text-muted`, right-aligned,
  truncates before the name would).
- Top-N shown: 6, ordered abnormal-first then by however long each has been
  waiting (data has this even though the field isn't displayed, per C-018 —
  display is name + type + flag only; ordering may still use fields not
  shown).
- Overflow footer: "+{n} more · View all results" linking to the result
  detail's future list view (route not yet defined — placeholder, flagged for
  `frontend-architect`).

### LiveIndicator

- 6px dot (`radius-full`, `color-accent`) + `text-xs` label "Live", 4px gap.
  Sits inline after the Queue widget's title/count. Pulses per
  `motion-live-pulse`; `prefers-reduced-motion` holds opacity 1.

## The four required states, per widget

**Empty**
- Queue: "No patients waiting. New check-ins will appear here automatically."
  — no illustration, just the message in `color-text-muted`, centered
  vertically in the space six rows would occupy so the widget doesn't jump
  size when it fills.
- Current consultation: "No consultation in progress. Start one from the
  queue when you're ready for the next patient." Same treatment.
- Awaiting review: "Nothing waiting on your review right now."

**Loading**
- Six `SkeletonRow` elements (Queue, Awaiting Review) or one skeleton card
  (Current Consultation) matching the real row/card height exactly —
  `color-surface-raised` pulse block, no layout shift on resolve.

**Error**
- Inline `ErrorBanner` replacing the widget's content area (header stays,
  so the doctor still knows which widget failed): "Couldn't load the queue.
  Retry." with a `text-sm` "Retry" link in `color-accent`. Each widget fails
  independently.

**Partial / stress**
- Queue at exactly 6 (no overflow row — demonstrated by the prototype's
  "Stress (queue at 6, no overflow)" control, verifying the footer border/
  spacing does not appear at the boundary), at 0 (empty state), at 40+
  (top-6 + "+34 more waiting · View full queue").
- A 40+ character patient name truncating cleanly in both QueueRow and
  PendingResultRow — demonstrated at the 640px (bp-sm) viewport, the
  narrowest breakpoint this feature supports per `design-system.md`; at the
  1440px design width the same names have enough column width that
  truncation does not visibly trigger, which is expected and not a defect.
- A consultation at 4+ hours elapsed (format switches from `mm:ss` to
  `h:mm`, never overflows the fixed-width time slot).
- A critical-triage patient arriving while 6 routine rows are already shown —
  displaces the lowest-priority visible row rather than appending past 6.

## Keyboard model and focus order

Tab order: sidebar (top to bottom, collapse toggle, then user menu) → header
(search trigger, notifications bell) → Queue widget (title has no focus stop,
rows in display order, footer link) → Current Consultation widget ("Open
chart", "End consultation") → Awaiting Review widget (rows, footer link).
Every row/card/link/button has a visible focus-visible ring (2px
`color-accent`, 2px offset) — no exceptions per `craft.md`. Enter/Space
activates a focused row exactly as a click would.

## Motion

- Row entering the live queue: `motion-base` (220ms, decelerate) transform +
  opacity, followed by `motion-highlight` (600ms linear) background fade.
- Hover/focus/active state changes: `motion-fast` (140ms).
- `prefers-reduced-motion`: entering rows appear without the transform/opacity
  animation (immediate) but keep the highlight-fade at its final state
  visible for one frame, then normal — the state change itself is never
  removed, only its motion.

## Copy

- Widget titles: "Queue", "Current consultation", "Awaiting review".
- Header greeting (page title slot): "Good morning, Dr. {LastName}" /
  afternoon/evening variant by local time — active voice, specific, not
  "Welcome back!".
- Empty/error copy: as specified above — states what's true, offers the next
  action, never blames the user, never "something went wrong".
