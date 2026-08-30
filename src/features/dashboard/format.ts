// Pure formatting helpers for the dashboard. No React, no side effects.
// Money is always passed as minor units (kobo). Percentages are passed
// already scaled to 0–100, never as a 0–1 ratio.

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

// Some ICU builds render `NGN` even for `narrowSymbol`; fall back to the plain
// number with a hand-prefixed ₦ in that case.
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

// `now` is injectable so callers and tests stay deterministic.
export function formatRelativeTime(
  iso: string,
  now: Date = new Date(),
): string {
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

export function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(n: number): string {
  return integerFormatter.format(n);
}

// `n` is already a percentage (`94.8 → "94.8%"`), not a 0–1 ratio.
export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

// Compact naira for cards and tiles: `₦2.9M` / `₦884K` / `₦950`, sign outside
// the symbol (`-₦2.9M`). Thresholds are on the absolute kobo value.
export function formatNairaCompact(amountMinor: number): string {
  const sign = amountMinor < 0 ? '-' : '';
  const abs = Math.abs(amountMinor);
  const major = abs / 100;

  if (abs < 100_000) return `${sign}₦${formatNumber(major)}`;
  if (abs < 100_000_000) return `${sign}₦${formatNumber(major / 1_000)}K`;
  if (abs < 100_000_000_000)
    return `${sign}₦${(major / 1_000_000).toFixed(1)}M`;
  return `${sign}₦${(major / 1_000_000_000).toFixed(1)}B`;
}

export function countLabel(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
