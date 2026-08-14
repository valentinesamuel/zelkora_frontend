# Art Direction

The product's visual point of view. Authored at stage 1 by
`senior-product-designer`, then locked. Conformance is checked at stage 2 and
stage 6.

Method and rationale:
`.claude/skills/senior-product-designer/references/art-direction.md`

Fill with values, not adjectives. Every choice carries a one-line reason tied to
this product specifically. A hedged non-choice here is worse than no file, because
it looks like a decision was made.

## Position

A clinical instrument, not a clinical *brand*. It should feel like something a
doctor trusts the way they trust a stethoscope — quiet, precise, immediately
legible under time pressure, with nothing between them and the next patient. It
must not feel like a consumer health app (soft, reassuring, decorative) and must
not feel like a bare admin spreadsheet with no hierarchy. The one place it is
allowed to feel alive is where the data itself is alive — the live queue.

## Typefaces

| Role | Family | Weights in use | Why this product |
|---|---|---|---|
| Display | IBM Plex Sans | 600 | Same family as body, used only larger/heavier for the page title and the doctor's name — restraint over a separate display face, which would be one more thing to keep visually coherent under time pressure. |
| Body / UI | IBM Plex Sans | 400, 500 | Humanist but drawn for technical/enterprise contexts (IBM's own product typeface) — legible at small sizes, doesn't carry the soft-friendly connotation of Inter/system-UI defaults or the warmth of a humanist serif. |
| Data / mono | IBM Plex Mono | 400, 500 | Same superfamily as body — tabular figures for wait-time counters, elapsed-time timers and timestamps read as clinical/instrument-like rather than decorative. |

Licensing and loading: IBM Plex is open-source (SIL OFL), self-hosted as
woff2, subset to Latin + the glyphs actually used. No external font CDN — this
is an internal tool with no tolerance for a third-party font request blocking
paint.

## Type scale

Ratio: ~1.2 (dense product UI per `craft.md`), with clean pixel values rather
than mathematically pure ratio steps.

| Token | Size | Line height | Weight | Tracking | Used for |
|---|---|---|---|---|---|
| text-xs | 11px | 16px | 500 | +0.02em | Uppercase chip/tag text (triage level, "Live") |
| text-sm | 12px | 16px | 400 | 0 | Secondary meta: wait time, elapsed time, timestamps |
| text-base | 14px | 20px | 400 | 0 | Body copy, queue row primary text |
| text-md | 16px | 24px | 500 | 0 | Widget titles, sidebar nav labels |
| text-lg | 19px | 24px | 600 | -0.01em | Page title, doctor's name in the header greeting |
| text-xl | 23px | 28px | 600 | -0.015em | Reserved for future full-page headers, unused in this feature |

## Density

| Metric | Value | Why |
|---|---|---|
| Control height | 32px | User-specified dense target (C-011) — buttons, inputs, chip controls |
| Table/queue row height | 36px | One line of primary text + one line of meta comfortably at text-base/text-sm without crowding |
| Intra-section spacing | 12px (space-3) | Related elements inside one widget sit close |
| Section spacing | 24px (space-6) | Exactly double intra-section spacing per `craft.md`'s vertical-rhythm rule — widgets read as distinct regions |

## Palette

Neutral temperature: cool, true-neutral with a faint blue undertone — reads as
precise/technical rather than the warm-cream or true-black defaults, and
avoids reintroducing clinic-flow's blue by keeping the *neutrals* nearly
achromatic and reserving actual blue-violet saturation for the accent alone.

| Role | Token | OKLCH | Contrast checked |
|---|---|---|---|
| Accent | accent | oklch(0.52 0.15 265) | 4.6:1 on neutral-0 — pass AA |
| Accent (muted, highlight-fade / selected) | accent-muted | oklch(0.94 0.02 265) | background only, not text |
| Surface | neutral-0 | oklch(0.99 0.002 250) | — |
| Raised surface | neutral-50 | oklch(0.97 0.003 250) | — |
| Border | neutral-100 | oklch(0.90 0.004 250) | 3.1:1 vs surface — pass AA (UI boundary) |
| Muted text | neutral-400 | oklch(0.55 0.006 250) | 4.5:1 on neutral-0 — pass AA |
| Body text | neutral-700 | oklch(0.32 0.006 250) | 9.8:1 on neutral-0 |
| Strong text | neutral-900 | oklch(0.18 0.006 250) | 14.1:1 on neutral-0 |
| Success | success | oklch(0.58 0.14 145) | 4.6:1 on neutral-0 |
| Warning | warning | oklch(0.70 0.15 70) | 3.2:1 on neutral-0 — large text/icon use only, paired with label per `craft.md` |
| Warning (small/body text) | warning-text | oklch(0.50 0.15 70) | 4.55:1 on the warning-tinted chip background (16% warning over neutral-0) — pass AA. Use for small/body text on a warning-tinted background (e.g. TriageChip's "urgent" label); `warning` itself stays reserved for icon/large-text use only |
| Danger | danger | oklch(0.55 0.19 25) | 5.0:1 on neutral-0 |

Accent is deliberately not blue-cyan "medical blue" (clinic-flow's rejected
look) — shifted toward indigo/violet at moderate saturation so it reads
precise and confident without repeating the disliked reference.

## Shape

Mixed with intent: containers and widget cards are sharp (radius-none) — the
product is a technical instrument, not a soft consumer surface. Controls
(buttons, inputs, chips, the current-consultation card's action buttons) get a
small radius-sm (4px), enough to read as touchable without looking soft.
Popovers/menus/modals get radius-md (8px), since floating surfaces read better
with slightly more softness than surfaces that sit flush against the page.

## Elevation

Dominant strategy: borders. Per `craft.md`, dense professional tooling wants
hairline borders, and shadows mostly disappear or look muddy in the dark theme
this product will eventually need. Every widget, row and card is bounded by a
1px neutral-100 border; no shadow at rest.

Tokens: `elevation-0` = 1px solid border, no shadow (default, everything at
rest). `elevation-1` = for genuinely floating surfaces only (dropdown menus,
the notifications panel) — `0 4px 12px oklch(0 0 0 / 0.08)` plus the same 1px
border, so it still reads as bounded rather than "lifted into space."

## Motion signature

Durations: 140ms for state changes (hover, active, focus, chip toggle), 220ms
for entrances (a widget's skeleton resolving to content, a panel opening).
Easing: `cubic-bezier(0.2,0,0,1)` (decelerate) on entrance, `cubic-bezier(0.4,0,1,1)`
(accelerate) on exit, standard ease for in-place state changes. Only
`transform`/`opacity` are animated.

The one orchestrated moment: when a new patient enters the live queue, the row
slides in from the top edge of the list (220ms, decelerate) and its background
briefly washes to `accent-muted` before fading back to the row's resting
background over 600ms. This is the only place motion is allowed to be
noticeable — it exists to answer one question ("did something just change?")
and nowhere else in the product gets this treatment.

## Signature element

The "Live" indicator: a 6px accent-coloured dot that pulses on a slow 2s cycle
(opacity 1 → 0.4 → 1) next to the word "Live" in the queue widget's header.
It is the one thing a doctor would name if asked what makes this dashboard feel
different from a static admin screen — proof the data in front of them is
current, not a page they loaded ten minutes ago. Under
`prefers-reduced-motion`, the dot holds steady opacity 1 and the "Live" label
alone carries the meaning.

## References

| Product | What specifically is borrowed |
|---|---|
| Linear | Colour used only for status/priority signal, never decoration; dense list rows with a visible but quiet hover affordance; no shadow noise. |
| Vercel dashboard | Hairline-border-first surface hierarchy with almost no shadow use, and a sidebar that stays quiet (icon+label, no per-item colour) so the content carries the hierarchy, not the nav. |

## Explicit rejections

No gradients anywhere, including on the primary action buttons. No
`rounded-2xl` softness on containers. No cards nested inside cards. No 4-across
row of stat tiles above a chart — counts live inline in widget headers, not as
separate tiles. No colour-only status signalling (every triage/abnormal
indicator pairs colour with a label or icon). No warm-cream/terracotta palette
and no near-black-with-neon-accent palette — both are current generated-design
defaults per the method reference, and neither fits a clinical instrument. No
decorative illustration anywhere, including in empty states.

## The justified risk

The pulsing "Live" indicator and the queue row's slide-in/highlight-fade are
genuine, noticeable motion in a product that is otherwise deliberately quiet
and boring-on-purpose. The risk is that a real-time animated element reads as
gimmicky in a clinical context. It is justified because it is spent in exactly
one place, answers a real clinical question (is this queue current right
now?), and every other surface in the product holds still.
