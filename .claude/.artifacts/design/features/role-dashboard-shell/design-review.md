# Design Review — Role Dashboard Shell (Doctor instance)
Reviewer: design-reviewer · Stage 2 · Iteration 1 · Scope: delta · 2026-07-26
Reviewed: Changed Surfaces from `manifest.md` — `prototype/theme.css`
(`@font-face` rules + `prototype/fonts/*.woff2`; `.header-title`,
`.header-actions`; `.content`/`.content-side` `min-width:0`;
`.viewport-frame.narrow`; `--color-warning-text` + `.triage-chip.urgent`),
`prototype/index.html` (widget copy, loading-skeleton row count, new
`QUEUE_BOUNDARY` fixture/state, longer `QUEUE_STRESS` name), `design-system.md`
Components table, `design-spec.md` Copy section — plus a full regression pass
over `prototype/index.html`/`theme.css`/`NOTES.md`, `art-direction.md`,
`product-architecture.md`, `handoff.md`, `current-feature.md`, `decisions.md`
(`D-role-dashboard-shell-6`). Rendered directly in Chrome at 1440×900 (all six
proto-bar states, light and dark colour schemes) and at the forced 640px
(bp-sm) viewport toggle. Font-face and warning-text contrast values
independently recomputed (OKLCH→sRGB, WCAG relative-luminance) rather than
taken on the producer's word.

## Verdict
APPROVED
All three Critical findings from iteration 0 are independently verified as
fixed, each in a way that satisfies the required fix as written rather than
skirting it: IBM Plex Sans/Mono are genuinely self-hosted `woff2` and load
(confirmed by reading the `@font-face` rules and the four font files present
on disk); the narrow-viewport contradiction is resolved by narrowing the
tested checkpoint to the design system's own bp-sm (640px) token — a
legitimate, documented scope decision (`D-role-dashboard-shell-6`) squarely
inside the AC's explicit mobile/tablet waiver, not a dodge, and the header
truncation bug at that width is genuinely fixed; and the TriageChip "urgent"
text now measures ~5.16:1 against its tinted background by independent
recalculation, clearing AA with margin in both colour schemes. All four Major
findings and all three Minor findings are also cleared. One new, low-stakes
observation surfaces from the fix itself (weight-500 text rendering from a
600-weight font file) — Minor, disclosed by the producer before this review
found it, and already flagged for correction before production.

## Scores
Art Direction Conformance: 9/10 — every committed axis now renders as
specified, including the two typefaces; the one remaining gap is that
weight-500 text is visually rendered by the 600-weight cut in this prototype.
Structural Conformance: 9/10 — terminology now matches
`product-architecture.md` exactly throughout ("Awaiting review" in title,
count and footer link); nav, IA and header layout still conform.
Visual Hierarchy: 8/10 — unchanged from iteration 0; still correct.
Typography: 8/10 — scale, line-height and tracking are now verifiably
correct in the rendered typeface; the 500→600 substitution is the only
remaining gap and is explicitly temporary.
Spacing and Density: 9/10 — unchanged; rhythm still holds without a one-off.
Alignment: 8/10 — unchanged; still correct.
Colour: 9/10 — the one flagged contrast failure is fixed and independently
verified in both colour schemes; palette discipline elsewhere unchanged.
Component Quality: 8/10 — Button/IconButton now documented in
`design-system.md`; Awaiting Review's loading skeleton now matches its own
top-N.
State Coverage: 9/10 — the missing queue-at-6 boundary permutation now exists
and is verified to hide the overflow footer correctly with no stray border.
Responsiveness: 8/10 — the shell now genuinely works at its narrowest
committed breakpoint (640px): single column, no horizontal scroll, header
truncates instead of colliding. Sub-640px remains explicitly out of scope per
the AC's own waiver, so this is not a residual defect.
Accessibility: 9/10 — recomputed contrast for the fixed TriageChip passes AA
with margin in light and dark; focus-visible remains implemented without
exception; colour is never the sole carrier of meaning.
Data Authenticity: 9/10 — unchanged; still a standout.
Professionalism: 9/10 — the three things that would have embarrassed the
team under real testing are now fixed and independently verified rather than
merely claimed.

Overall: 95/100

## Critical
None.

## Major
None.

## Minor

[Minor] Weight-500 text is rendered by the 600-weight (SemiBold) font file, not a true Medium cut
Location: `prototype/theme.css` lines 12–18, 26–32 (`@font-face` `font-weight:
500 600` ranges for both IBM Plex Sans and IBM Plex Mono, each backed by only
the SemiBold file); affects `.widget-title`, `.nav-item.active`,
`.consult-name` (all `text-md`/weight 500 per `design-system.md`)
Observed: Only Regular (400) and SemiBold (600) cuts were sourced for this
prototype. The `500 600` font-weight range on the SemiBold `@font-face`
means every element specified at weight 500 (widget titles, the active nav
item, the consultation name) actually renders at the heavier 600 weight —
disclosed transparently in `NOTES.md` as a known, temporary substitution.
Consequence: Low — the visual difference between Plex Sans 500 and 600 is
subtle, this is honestly disclosed rather than silently faked, and it does
not reproduce the original defect (the original Critical was a complete
fallback to a system font; this is real Plex rendering at an approximated
weight). Left as-is, production would ship a slightly heavier weight than
`art-direction.md` specifies wherever weight 500 is called for.
Required: Source a true IBM Plex Sans/Mono Medium (500) `woff2` subset before
or during stage 5 and give it its own `@font-face` rule, rather than carrying
the `500 600` range substitution into production.

## Strengths
Every fix reads as a genuine correction rather than a minimal patch to clear
the gate. The font fix didn't stop at "a file loads" — it used real subset
`woff2` files, kept `font-display: swap`, and the producer proactively
disclosed the one remaining gap (the 500→600 substitution) in `NOTES.md`
before this review found it, which is exactly the right instinct for a
prototype under review. The viewport fix is the strongest of the three: rather
than forcing an arbitrary 360px to visually work by squeezing components,
`D-role-dashboard-shell-6` correctly identifies that 360px was never a
committed breakpoint token in the first place, narrows the claim to the
design system's actual narrowest commitment (bp-sm/640px), fixes a genuine bug
at that real width (header-title collision), and explicitly leaves narrower
widths flagged unverified rather than silently implying they work — this is
the honest resolution the required fix asked for, not the cheaper one. The
new `QUEUE_BOUNDARY` fixture and `boundary` proto-bar control make the
exactly-6 edge case something a future reviewer can see rather than only take
on faith, which is the same standard the review protocol expects of the
review itself.

## Cross-Cutting Notes
None outside remit this review.

## Reopen Requests
None. `D-role-dashboard-shell-6` (bp-sm as the narrowest verified viewport) is
a sound, AC-delegated scope decision, not a defect — recorded as settled, not
reopened.

## Required Changes for Next Stage
- Source true IBM Plex Sans/Mono Medium (500) `woff2` subsets and give them
  their own `@font-face` rule, replacing the current `500 600`-range
  substitution off the SemiBold file. Assigned to: `staff-ui-engineer` (stage
  5), since it is a production-asset sourcing task rather than a design
  decision.
