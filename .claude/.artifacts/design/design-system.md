# Design System

The design source of truth, emitted from `art-direction.md`. Authored and extended
at stage 1; consumed at stages 2, 4, 5 and 6. This file is what
`src/styles/theme.css` is generated from, so every value here must be a real value.

A component belongs here once a second feature uses it, or once it is a primitive.
Feature-specific components stay in the feature.

## Tokens

### Typography
| Token | Value |
|---|---|
| font-display | 'IBM Plex Sans', sans-serif |
| font-body | 'IBM Plex Sans', sans-serif |
| font-mono | 'IBM Plex Mono', monospace |
| text-xs | 11px / 16px line-height / weight 500 / +0.02em tracking |
| text-sm | 12px / 16px line-height / weight 400 / 0 tracking |
| text-base | 14px / 20px line-height / weight 400 / 0 tracking |
| text-md | 16px / 24px line-height / weight 500 / 0 tracking |
| text-lg | 19px / 24px line-height / weight 600 / -0.01em tracking |
| text-xl | 23px / 28px line-height / weight 600 / -0.015em tracking |

### Spacing
Scale base: 4px
| Token | Value |
|---|---|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-5 | 20px |
| space-6 | 24px |
| space-8 | 32px |
| space-10 | 40px |
| space-12 | 48px |
| space-16 | 64px |

### Colour
| Token | Light | Dark |
|---|---|---|
| color-accent | oklch(0.52 0.15 265) | oklch(0.68 0.14 265) |
| color-accent-muted | oklch(0.94 0.02 265) | oklch(0.26 0.05 265) |
| color-surface | oklch(0.99 0.002 250) | oklch(0.16 0.004 250) |
| color-surface-raised | oklch(0.97 0.003 250) | oklch(0.20 0.004 250) |
| color-border | oklch(0.90 0.004 250) | oklch(0.28 0.004 250) |
| color-text-muted | oklch(0.55 0.006 250) | oklch(0.65 0.006 250) |
| color-text-body | oklch(0.32 0.006 250) | oklch(0.85 0.006 250) |
| color-text-strong | oklch(0.18 0.006 250) | oklch(0.95 0.004 250) |
| color-success | oklch(0.58 0.14 145) | oklch(0.68 0.14 145) |
| color-warning | oklch(0.70 0.15 70) | oklch(0.75 0.15 70) |
| color-warning-text | oklch(0.50 0.15 70) | oklch(0.75 0.15 70) (same as color-warning) |
| color-danger | oklch(0.55 0.19 25) | oklch(0.65 0.19 25) |

`color-warning` is 3.2:1 against `color-surface` — icon/large-text use only, per
`art-direction.md`. `color-warning-text` is the AA-passing (≥4.5:1) variant for
small/body text rendered on a `color-warning`-tinted background, e.g. TriageChip's
"urgent" label. In the dark theme, `color-warning` itself already clears AA for
small text, so `color-warning-text` is identical there.

### Radius
| Token | Value |
|---|---|
| radius-none | 0px — containers, widget cards, sidebar |
| radius-sm | 4px — buttons, inputs, chips |
| radius-md | 8px — popovers, menus, modals |
| radius-full | 999px — avatar, live-indicator dot |

### Elevation
| Token | Value |
|---|---|
| elevation-0 | 1px solid var(--color-border), no shadow — default resting state |
| elevation-1 | 0 4px 12px oklch(0 0 0 / 0.08), plus 1px solid var(--color-border) — floating surfaces only (dropdowns, notification panel) |

### Motion
| Token | Duration | Easing |
|---|---|---|
| motion-fast | 140ms | cubic-bezier(0.2, 0, 0, 1) — hover, active, focus, chip toggle |
| motion-base | 220ms | cubic-bezier(0.2, 0, 0, 1) on enter, cubic-bezier(0.4, 0, 1, 1) on exit |
| motion-highlight | 600ms | linear fade from color-accent-muted back to resting background |
| motion-live-pulse | 2000ms | ease-in-out, opacity 1 → 0.4 → 1, infinite |

### Breakpoints
| Token | Value |
|---|---|
| bp-sm | 640px |
| bp-md | 768px |
| bp-lg | 1024px |
| bp-xl | 1280px (primary design target — desktop hospital workstation) |
| bp-2xl | 1536px |

### Z-index
| Token | Value | Used for |
|---|---|---|
| z-nav | 10 | Sidebar |
| z-header | 20 | Top header bar |
| z-dropdown | 30 | User menu, notifications panel |
| z-modal | 40 | Confirmation dialogs |
| z-toast | 50 | Toasts/error banners |

## Components

| Component | Variants | Sizes | States | Do not use when |
|---|---|---|---|---|
| Button | primary (`color-accent` fill), secondary (border, no fill) | height 32px (control height), width flexes to container or content | default, hover, focus-visible, disabled | A single icon with no label — use IconButton |
| IconButton | default (bordered square) | 32px × 32px (control height) | default, hover, focus-visible | The action has a label to show — use Button so the action isn't icon-only |
| Sidebar | expanded, collapsed (icon-only) | — | active item, hover, focus-visible | Never — present on every authenticated page |
| Header | — | — | default | Never — present on every authenticated page |
| WidgetCard | — | — | default, loading (skeleton), error, empty | Content is a single primitive value with no internal structure — use inline text instead |
| QueueRow | waiting, in-progress (folded status, unused this feature since consultation is a separate widget) | — | default, hover, focus-visible, entering (slide-in + highlight-fade) | Queue list exceeds the fixed top-N — use the overflow link instead of rendering more rows |
| TriageChip | routine, urgent, critical | — | default | The urgency is not clinically assigned — never invent a triage level for display purposes |
| CurrentConsultationCard | active, none-in-progress (empty) | — | default, loading, empty | More than one consultation is active at once (not modelled — see `D-role-dashboard-shell-` C-009) |
| PendingResultRow | normal, abnormal | — | default, hover, focus-visible | The result is not yet completed by the lab (belongs to a future "ordered" tracking view, not this widget per C-008) |
| LiveIndicator | live | — | default (pulsing), reduced-motion (static) | The underlying data is not actually updating live |
| EmptyState | — | — | default | Never as a bare centred illustration — always states what the widget is for and what will appear |
| SkeletonRow | — | matches QueueRow / PendingResultRow height | loading | Content has already resolved — swap to the real row immediately |
| ErrorBanner | — | — | default, with retry action | The error is not actionable/recoverable by the user — state what happened without a dead retry button |

## Interaction patterns

Focus ring: 2px solid var(--color-accent), 2px offset, on every focusable
element without exception, including rows and chips.
Hover: background washes to color-surface-raised; no shadow introduced on hover.
Selection: not used in this feature (no bulk selection anywhere on the dashboard).
Destructive actions: confirmation dialog whose confirm button repeats the verb
("End consultation", never "Confirm").
Loading: skeleton rows matching the real row's height and layout, count equal
to the typical top-N shown once resolved — never a generic spinner for
list content.
Empty states: explain what the widget is for and, where applicable, what will
make it populate (e.g. "No patients waiting — new check-ins will appear here
automatically").
Error presentation: inline banner within the affected widget, states what
happened in the interface's voice, offers retry where retrying is meaningful.

## Change log

| Date | Change | Feature | Decision ID |
|---|---|---|---|
| 2026-07-26 | Authored full token set and first component set (Sidebar, Header, WidgetCard, QueueRow, TriageChip, CurrentConsultationCard, PendingResultRow, LiveIndicator, EmptyState, SkeletonRow, ErrorBanner) from scratch | role-dashboard-shell | D-role-dashboard-shell-1, -2, -3, -4 |
| 2026-07-26 | Added `color-warning-text` token (AA-passing small-text variant of `color-warning`, fixing the TriageChip contrast failure) and documented Button/IconButton as components, responding to design-reviewer's REJECTED verdict | role-dashboard-shell | D-role-dashboard-shell-6 |
