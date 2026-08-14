# Prototype notes

Open `index.html` directly in a browser. No build step.

## What's real

- Every token in `theme.css` is transcribed directly from `art-direction.md`
  and `design-system.md` — no raw hex/px values in the markup or CSS beyond
  the custom properties themselves.
- IBM Plex Sans (400, 600) and IBM Plex Mono (400, 600) are self-hosted as
  subset woff2 files under `fonts/` and loaded via `@font-face` — no
  `local()`-only fallback and no external font CDN, per `art-direction.md`'s
  stated method. Weight-500 requests (widget titles, nav active state, the
  consultation name) are served by the same 600-weight face via a
  `font-weight: 500 600` range on the `@font-face` rule, since only Regular
  and SemiBold cuts were sourced for this prototype — real Medium (500) files
  should be sourced before production at stage 5.
- Layout, spacing, type scale, colour, radius, elevation and motion all match
  `design-spec.md` exactly (widget grid, 220px sidebar, 56px header, 36px
  rows, etc.).
- Focus-visible rings, hover states, and the live-queue entrance animation
  (row slide-in + highlight-fade) are real and functional, not described.
- `prefers-reduced-motion` is honored (disables the live-pulse dot animation,
  the row-entrance animation, and the skeleton shimmer) — test via your OS
  accessibility settings, there is no in-page toggle for it.
- Fixture data is realistic Nigerian clinical names with internally
  consistent triage levels, wait times and result types — not Lorem ipsum,
  not "John Doe."
- The TriageChip "urgent" label uses the new `color-warning-text` token
  (oklch(0.50 0.15 70), ~4.55:1 against the chip's tinted background) instead
  of `color-warning` (3.2:1, icon/large-text only) — verified AA pass at the
  size and background this label actually renders at.

## What's faked

- All navigation items besides "Dashboard" are visibly present (per the
  confirmed nav model, `D-role-dashboard-shell-1`) but disabled — they don't
  route anywhere, because only Dashboard exists as of this feature.
- Global search and notifications are visual placeholders — clicking them
  does nothing. Per `product-architecture.md`, they are shared surfaces this
  feature reserves space for but does not implement behavior for.
- The consultation elapsed timer is a static string, not a real running
  clock — a live timer is an implementation detail for stage 5, not something
  a static prototype needs to simulate correctly.
- The "Live" pulse is decorative animation only; there is no real polling or
  websocket connection. The row-entrance state (visible via the "Default"
  button, which marks one row as freshly-arrived on load) simulates what a
  live update looks like when it happens.

## What's deliberately out of scope

- Any content behind the disabled nav items (Patients, Queue & Appointments,
  Consultations, Lab, Pharmacy, Billing & Claims, Inventory, Staffing,
  Reports) — future features.
- Mobile/tablet-specific layouts below bp-sm (640px) — the viewport toggle
  verifies the shell down to 640px (content stacks to one column, no
  horizontal scroll, header title truncates instead of colliding with
  search), which is the narrowest breakpoint token this feature commits to.
  Phone-class widths below that are unverified and out of scope, per the
  AC's explicit mobile/tablet allowance. See `D-role-dashboard-shell-6`.
- A hospital-switcher — assumed unnecessary per `D-role-dashboard-shell-5`.

## Review controls (prototype-only, not part of the design)

The dark bar at the top of the page is review tooling, not product UI:

- **Default** — the happy-path populated state, 6-of-9 queue, one flagged
  result, one active consultation. The first queue row plays its live-arrival
  animation on load.
- **Empty** — all three widgets in their empty state.
- **Loading** — all three widgets in skeleton state, each sized to its
  widget's real top-N (6 rows for both Queue and Awaiting Review) so nothing
  shifts on resolve.
- **Error** — all three widgets in an independent error state (note each
  widget fails on its own; there's no scenario where one error blanks the
  others).
- **Stress (40+ queue, long names)** — 41-deep queue (top 6 + overflow link)
  and a 19-deep Awaiting Review queue (top 6 + overflow link). Long
  compound-surname names are realistic (not padding), and at this control's
  1440px design width they have enough column width that ellipsis truncation
  doesn't visibly trigger — see the 640px viewport control below for where
  truncation is actually demonstrated.
- **Stress (queue at 6, no overflow)** — the boundary case: exactly 6 queue
  rows with the overflow footer hidden, verifying no stray border/spacing
  appears at the exact top-N boundary.
- **640px viewport (bp-sm)** — constrains the frame to the narrowest
  breakpoint token this feature commits to. Confirms the single-column
  reflow, no horizontal scroll, and (combined with the Stress control's long
  names) that name truncation actually triggers at a real supported width.

## Screen-to-spec mapping

Everything on this one page corresponds to `design-spec.md` in full — this
feature has exactly one screen (the dashboard), so there is no separate
index-of-screens file.
