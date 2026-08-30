// Pure formatting helpers for the dashboard. No React, no side effects.

const nairaCurrencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  currencyDisplay: 'narrowSymbol',
});

const nairaNumberFormatter = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('en-NG', {
  maximumFractionDigits: 0,
});

/**
 * `amountMinor` is kobo. Returns e.g. `₦1,234.50`.
 * Some runtimes ship an ICU build that renders `NGN` even for narrowSymbol —
 * in that case we format the plain number and prefix the symbol ourselves.
 */
export function formatNaira(amountMinor: number): string {
  const major = amountMinor / 100;
  const formatted = nairaCurrencyFormatter.format(major);
  if (formatted.includes('NGN')) {
    return `₦${nairaNumberFormatter.format(major)}`;
  }
  return formatted;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/**
 * `now` is injectable so callers and tests stay deterministic.
 * Future timestamps clamp to "just now".
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < MINUTE_MS) return 'just now';
  if (diffMs < HOUR_MS) return `${Math.floor(diffMs / MINUTE_MS)} min ago`;
  if (diffMs < DAY_MS) return `${Math.floor(diffMs / HOUR_MS)} h ago`;
  if (diffMs < WEEK_MS) return `${Math.floor(diffMs / DAY_MS)} d ago`;

  return then.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Plain integer with thousands separators, no decimals. `1234 → "1,234"`. */
export function formatNumber(n: number): string {
  return integerFormatter.format(n);
}

/**
 * `n` is ALREADY a percentage value — `94.8 → "94.8%"` — NOT a 0–1 ratio.
 * Passing `0.948` here (expecting `"94.8%"`) is the likeliest silent bug at a
 * call site; it renders `"0.9%"`. Percentages in the data layer are stored as
 * `94.8` (see the dashboard types files).
 */
export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

/**
 * `amountMinor` is kobo. Compact naira for cards and tiles:
 * `₦2.9M` / `₦884K` / `₦950`. Thresholds on the absolute kobo value:
 *   < 100_000            → plain naira, 0 decimals   (₦950)
 *   < 100_000_000        → thousands, 0 decimals     (₦884K)
 *   < 100_000_000_000    → millions, 1 decimal       (₦2.9M)
 *   otherwise            → billions, 1 decimal       (₦3.1B)
 * The sign sits OUTSIDE the symbol: `-₦2.9M`.
 */
export function formatNairaCompact(amountMinor: number): string {
  const sign = amountMinor < 0 ? '-' : '';
  const abs = Math.abs(amountMinor);
  const major = abs / 100;

  if (abs < 100_000) return `${sign}₦${formatNumber(major)}`;
  if (abs < 100_000_000) return `${sign}₦${formatNumber(major / 1_000)}K`;
  if (abs < 100_000_000_000) return `${sign}₦${(major / 1_000_000).toFixed(1)}M`;
  return `${sign}₦${(major / 1_000_000_000).toFixed(1)}B`;
}

/**
 * The glyph and the sign carry the meaning; colour only reinforces it.
 * Currently unused after Phase 5 retired `KpiBand` (its sole caller); kept
 * because it is pure, tested (`format.test.ts`) and plausibly reused.
 */
export function formatDelta(value: number): {
  glyph: '▲' | '▼' | '–';
  text: string;
} {
  if (value > 0) return { glyph: '▲', text: `+${value}` };
  if (value < 0) return { glyph: '▼', text: String(value) };
  return { glyph: '–', text: '0' };
}
