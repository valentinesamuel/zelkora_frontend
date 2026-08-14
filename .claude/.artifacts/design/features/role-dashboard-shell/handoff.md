# Handoff — Role Dashboard Shell (Doctor instance)

## What I built

- `art-direction.md` and `product-architecture.md`, authored from scratch —
  this is the first feature in the pipeline, so both were unfilled templates.
  Locked for stage 2/6 conformance checks going forward.
- `design-system.md` with a full token set and the first ten components.
- The dashboard shell: a persistent collapsible sidebar (10 top-level
  destinations, 9 disabled/reserved), a header with global search and
  notifications placeholders, and a two-column widget layout.
- Full Doctor content: Queue widget (top-6 by triage-then-wait, overflow
  link), Current Consultation widget (single active card, not a list), and
  Awaiting Review widget (top-6, abnormal-flagged).
- A working static prototype at `prototype/` covering default, empty,
  loading, error and stress states (including a queue-at-exactly-6 boundary
  case), plus a 640px (bp-sm) viewport check, all wired with real interaction
  (hover, focus-visible, live-arrival animation, reduced-motion handling).
- Self-hosted IBM Plex Sans/Mono woff2 subsets under `prototype/fonts/`.

## Decisions a reviewer should understand before judging this

- The three widgets are **not** an equal-width three-column grid. Queue is
  the dominant 2fr region; Current Consultation and Awaiting Review stack in
  a 1fr side column. This was a self-critique correction — three equal boxes
  reads as an undecided layout, and Queue is both the highest-priority
  workflow (`current-feature.md`'s priority order) and the most
  content-dense widget, so it earns the dominant region.
- "End consultation" does **not** open a confirmation dialog. It was
  originally specified with one (mirroring a generic destructive-action
  pattern I was drafting for `product-architecture.md`), but self-critique
  caught that ending a consultation is a routine, high-frequency completion
  action, not a destructive one — confirming it every time would fight the
  density/speed goal the whole feature is built around. Fixed in both
  `design-spec.md` and the destructive-action pattern's example in
  `product-architecture.md`.
- Nine of ten sidebar destinations are visible but disabled. This is
  deliberate: the navigation model (`D-role-dashboard-shell-1`) is a
  product-wide decision made now so every future feature conforms to it, but
  only Dashboard exists yet. A reviewer should not read the disabled items as
  unfinished work on this feature — they're placeholders by design.
- Global search and the notifications bell are non-functional in this
  feature. They're shared surfaces the user confirmed should exist in the
  shell now (C-016), but no feature populates their behavior yet.

## Known trade-offs

- The queue's "fixed top-6" pattern means a doctor with a long queue does not
  see everyone at a glance from the dashboard — mitigated by an overflow
  count and a one-click link to the full queue view (not yet built).
- The sidebar's disabled-item icons are a plain filled/outline square
  placeholder, not a real icon per destination. A real icon set is an
  implementation-stage concern (stage 5), not something worth hand-designing
  nine bespoke icons for in a throwaway prototype.
- No dark-theme screens exist in the prototype (only in `theme.css`'s
  `prefers-color-scheme` values) — the tokens are correct but not visually
  verified side-by-side. Flagging this rather than silently skipping it.

## The risk I'm least sure about

The live-update motion signature (row slide-in + accent highlight-fade) is
the one place I took a real aesthetic risk, and it's unverified against
actual update frequency. If queue changes happen very often (e.g. every few
seconds during a busy shift), the animation could read as constant flicker
rather than a considered "something changed" signal — I don't have real data
on check-in frequency to know which. `frontend-architect` should treat this
as a candidate for debouncing/coalescing rapid updates at stage 4 rather than
animating every single change independently.

## Self-critique (anti-ai-playbook.md, run against this prototype)

- **Choices specific to this product, not a generic dashboard brief**: the
  Queue-dominant asymmetric grid (not equal thirds); the triage-ordered top-6
  with overflow link, driven directly by the "varies too much to cap"
  answer; the single-current-consultation card instead of a generic
  "active items" list, driven by the confirmed one-at-a-time clinical model;
  the Live pulse tied to a real confirmed requirement (live updates), not a
  decorative default.
- **What I'd produce for a generic dashboard brief, and how this differs**: a
  generic brief gets three equal stat-tile-style cards, blue accent, rounded
  corners, and static "last updated" text. This has an indigo (not
  clinic-flow blue) accent, sharp containers with only controls rounded, an
  asymmetric grid, and a genuinely live-updating primary widget — the
  difference is real, not cosmetic.
- **Is every spacing/type/colour value from the system**: yes — `theme.css`
  declares every value as a custom property from `art-direction.md`/
  `design-system.md`; no raw hex or arbitrary pixel values appear in the
  markup.
- **Does density match the stated target throughout**: yes — 32px controls,
  36px rows, 12px/24px spacing rhythm held in the sidebar, header, and all
  three widgets without exception.
- **Single weakest screen, and why I left it**: the header's global search
  and notifications are the weakest part — they're visually resolved but
  functionally inert placeholders, because this feature's scope is Dashboard
  content, not search or notification behavior. I left it because building
  real behavior for a shared surface ahead of any feature that needs it
  would be scope creep past what was confirmed in C-016 (placeholder only).
- Corrected during self-critique, not left: the equal-column grid (fixed to
  asymmetric) and the confirmation dialog on "End consultation" (removed) —
  see "Decisions a reviewer should understand" above.

## Required changes addressed

`Status` entering this iteration was `changes-required` after design-reviewer's
REJECTED verdict (iteration 0). All findings return to this stage on a REJECTED
verdict — there is no separate Required Changes table to clear. Addressed below,
item by item, referencing `design-review.md`.

**Critical**

1. *Declared typefaces never render*: `theme.css`'s `@font-face` rules replaced
   `local()`-only sourcing with real, self-hosted, Latin-subset woff2 files
   (`prototype/fonts/IBMPlexSans-{Regular,SemiBold}.woff2`,
   `IBMPlexMono-{Regular,SemiBold}.woff2`), subset from real IBM Plex TTF/woff2
   sources with `fonttools`/`pyftsubset`. Verified via `document.fonts.check()`
   and `document.fonts` status — both families report `loaded`, not falling
   back to system sans. Only Regular (400) and SemiBold (600) cuts were
   sourced; weight-500 requests are served by the 600 face via a
   `font-weight: 500 600` range on the `@font-face` rule rather than an
   unpredictable browser-side nearest-weight fallback. True Medium (500) files
   should be sourced before stage 5 production implementation — noted in
   `prototype/NOTES.md`.
2. *Dashboard breaks at its own tested narrow viewport*: the invented 360px
   checkpoint was below every breakpoint token in `design-system.md` (bp-sm is
   640px) and is replaced with a genuine bp-sm (640px) check — see
   `D-role-dashboard-shell-6`. Fixed two real bugs this exposed: (a) the
   header title now truncates with ellipsis instead of wrapping into the
   search trigger, (b) `.content`'s grid items lacked `min-width: 0`, so
   CSS Grid's default `min-width: auto` let a long queue-row name force the
   whole page wider than its viewport (a real horizontal-scroll bug, not just
   the sidebar). Verified via Playwright at a native 640px viewport: no
   horizontal overflow, single-column reflow holds, long names truncate
   correctly. Widths below 640px remain explicitly out of scope.
3. *TriageChip "urgent" text fails AA*: added `color-warning-text`
   (oklch(0.50 0.15 70)) to `design-system.md`/`art-direction.md`, computed to
   clear 4.5:1 against the chip's actual composited background (verified
   ≈4.55:1, not the palette table's general large-text note). `color-warning`
   itself is untouched and stays icon/large-text-only as originally scoped.

**Major**

4. *"Pending results" vocabulary drift*: renamed to "Awaiting review"
   throughout the prototype's copy and `design-spec.md`'s Copy section,
   conforming to `product-architecture.md`'s terminology table. The internal
   component identifier `PendingResultRow` in `design-system.md` is unchanged
   — it's a code-facing name, not displayed copy, same as `QueueRow`.
5. *Awaiting Review loading skeleton showed 4 rows against a 6 top-N*: now
   renders 6 `SkeletonRow` placeholders, matching the Queue widget's pattern
   and `design-spec.md`'s stated count.
6. *Missing "queue at exactly 6, no overflow" stress state*: added a new
   prototype control ("Stress (queue at 6, no overflow)") with a dedicated
   6-entry fixture and the overflow footer hidden — verified via Playwright
   that exactly 6 rows render and the footer's `display` is `none`.

**Minor**

7. *No documented Button primitive*: added Button and IconButton to
   `design-system.md`'s component table.
8. *Current Consultation loading skeleton height mismatch*: replaced the
   generic 36px `.skeleton-row` for the name/elapsed row with a block sized to
   the active card's actual 24px line-height, closing the ~12px gap.
9. *Long-name truncation never demonstrated*: rather than inventing an
   unrealistically long name to force truncation at the 1440px design width
   (which would cost `craft.md`'s data-authenticity standard), truncation is
   now demonstrated at the 640px (bp-sm) viewport control, where the existing
   realistic long compound names genuinely overflow their column and
   ellipsis-truncate — verified via Playwright (`scrollWidth > clientWidth`
   before the fix, clean truncation after).
