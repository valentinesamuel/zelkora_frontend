# Art Direction — Zelkora CMO Dashboard

The visual point of view that shipped with the CMO dashboard overhaul. All values are
transcribed from `src/index.css` (the single theme file); read them there, not here, if they
ever disagree.

## Position

Warm, spacious and legible for non-technical clinical executives. The board reads at a glance:
KPIs carry light-touch graphics (icon chip, value, delta, sparkline), the dedicated analytics
row carries the heavy charting, and system telemetry is demoted to a quiet band at the bottom.
Graphics are used with restraint — a chart earns its place by answering a capacity, flow or
performance question, not by decorating the page.

## Typefaces

- **Plus Jakarta Sans** for Display, Body and UI — one variable family across the whole product.
  - `--font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - `--font-sans:    'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Display and Body resolve to the same stack; `font-display` marks intent (headings, KPI
    values) so a future weight/tracking split has a hook.
- **System monospace** for tabular figures only:
  `--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. No bundled mono face.
- Self-hosted **variable woff2** (weight axis 200–800, SIL OFL) at
  `public/fonts/PlusJakartaSans-VariableFont_wght.woff2`, preloaded from `index.html` with
  `crossorigin`. **No font CDN** — `fonts.googleapis.com` / `@import url()` are never used; if
  the font cannot be self-hosted the work blocks rather than falls back to a link.

## Shape

| Surface | Token | Value |
|---|---|---|
| Containers / cards | `--radius-lg` | `0.75rem` (12px) |
| Floating surfaces (popover, dropdown, sheet) | `--radius-md` | `0.5rem` (8px) |
| Controls / chips / icon buttons | `--radius-sm` | `0.375rem` (6px) |

`--radius` itself stays `0.25rem` **on purpose**. `--radius-xl / -2xl / -3xl / -4xl` are
`calc(var(--radius) + 4/8/12/16px)`, so raising the base silently inflates every `rounded-xl+`
shadcn surface (dialogs, popovers, sheets). `--radius-sm/-md/-lg` are therefore set as explicit
literals, decoupled from the calc chain. This is the single most useful line in this file for
whoever touches the theme next.

The load-bearing comment in `src/index.css` cites "Decision B2 (`D-cmo-dashboard-4`)" — a stale
ID pointing at a decision log that no longer exists. Leave the comment; do not chase the ID.

## Elevation

Cards carry **`--shadow-card`** *in addition to* the hairline `border` — the border defines the
edge, the shadow lifts the card off the ground. One soft, tinted, themed token:

- `:root`  — `0 1px 2px oklch(0.2 0.02 265 / 0.06), 0 4px 12px oklch(0.2 0.02 265 / 0.08)`
- `.dark`  — `0 1px 2px oklch(0 0 0 / 0.4), 0 4px 12px oklch(0 0 0 / 0.3)`

Self-aliased in `@theme inline` so Tailwind emits a `shadow-card` utility (no
`shadow-[var(--shadow-card)]` at call sites).

## Palette

Accent is **indigo** and does not change: `--primary` / `--ring` / `--sidebar-primary` /
auth screens all read `oklch(0.52 0.15 265)` in light, `oklch(0.68 0.14 265)` in dark.

Categorical chart roles `--chart-1..5` — indigo / teal / amber / rose / green, distinct light
and dark values (every token has a `.dark` counterpart):

| Role | `:root` | `.dark` |
|---|---|---|
| `--chart-1` indigo | `oklch(0.52 0.15 265)` | `oklch(0.68 0.14 265)` |
| `--chart-2` teal | `oklch(0.70 0.12 190)` | `oklch(0.78 0.11 190)` |
| `--chart-3` amber | `oklch(0.80 0.15 80)` | `oklch(0.85 0.14 80)` |
| `--chart-4` rose | `oklch(0.65 0.20 15)` | `oklch(0.72 0.18 15)` |
| `--chart-5` green | `oklch(0.62 0.16 150)` | `oklch(0.72 0.15 150)` |

Colour is never the only channel: deltas carry a direction glyph and a text label, chart series
carry legends and an `sr-only` trend summary, status carries its word.

## Layout metric

`--chart-card-h: 16.25rem` (260px) — the fixed body height every `ChartCard` gives its
`ResponsiveContainer` so a chart can never resolve to `height: 0` inside a flex/grid cell. The
lazy-load `Suspense` fallback matches this height so charts do not shift the page in.
