import { describe, expect, it } from 'vitest';

import {
  formatDelta,
  formatNaira,
  formatNairaCompact,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from './format';

// Pure-function coverage for the dashboard formatters. Node env, no DOM.
// These are the first non-`apiClient` unit tests in the repo (plan Phase 8 step 4).

describe('formatNaira', () => {
  it('renders kobo as naira with a narrow symbol and thousands separators', () => {
    expect(formatNaira(123450)).toBe('₦1,234.50');
  });

  it('renders zero as ₦0.00', () => {
    expect(formatNaira(0)).toBe('₦0.00');
  });

  it('keeps the minus sign for negative amounts', () => {
    expect(formatNaira(-429900)).toBe('-₦4,299.00');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-08-29T12:00:00.000Z');

  it('reports whole minutes for sub-hour gaps', () => {
    const then = new Date(now.getTime() - 5 * 60_000).toISOString();
    expect(formatRelativeTime(then, now)).toBe('5 min ago');
  });

  it('reports whole hours for sub-day gaps', () => {
    const then = new Date(now.getTime() - 2 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(then, now)).toBe('2 h ago');
  });

  it('collapses anything under a minute to "just now"', () => {
    const then = new Date(now.getTime() - 20_000).toISOString();
    expect(formatRelativeTime(then, now)).toBe('just now');
  });
});

describe('formatNumber', () => {
  it('adds thousands separators and drops decimals', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1234.7)).toBe('1,235');
  });

  it('renders small values and zero without separators', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
  });
});

describe('formatPercent', () => {
  it('treats the input as an already-scaled percentage, not a ratio', () => {
    expect(formatPercent(94.8)).toBe('94.8%');
  });

  it('honours an explicit digit count', () => {
    expect(formatPercent(94.8, 0)).toBe('95%');
    expect(formatPercent(3, 2)).toBe('3.00%');
  });

  it('keeps the sign for negative percentages', () => {
    expect(formatPercent(-4.2)).toBe('-4.2%');
  });
});

describe('formatNairaCompact', () => {
  it('renders sub-₦1,000 amounts plain, 0 decimals', () => {
    expect(formatNairaCompact(95_000)).toBe('₦950');
  });

  it('uses K for thousands with 0 decimals', () => {
    expect(formatNairaCompact(88_400_000)).toBe('₦884K');
  });

  it('uses M for millions with 1 decimal', () => {
    expect(formatNairaCompact(294_050_000)).toBe('₦2.9M');
  });

  it('uses B for billions with 1 decimal', () => {
    // 310_000_000_000 kobo === ₦3,100,000,000
    expect(formatNairaCompact(310_000_000_000)).toBe('₦3.1B');
  });

  it('crosses each threshold at the documented boundary', () => {
    expect(formatNairaCompact(99_999)).toBe('₦1,000');
    expect(formatNairaCompact(100_000)).toBe('₦1K');
    expect(formatNairaCompact(100_000_000)).toBe('₦1.0M');
    expect(formatNairaCompact(100_000_000_000)).toBe('₦1.0B');
  });

  it('puts the minus sign outside the symbol', () => {
    expect(formatNairaCompact(-294_050_000)).toBe('-₦2.9M');
  });

  it('renders zero as ₦0', () => {
    expect(formatNairaCompact(0)).toBe('₦0');
  });
});

describe('formatDelta', () => {
  it('marks a positive value with ▲ and a signed label', () => {
    expect(formatDelta(12)).toEqual({ glyph: '▲', text: '+12' });
  });

  it('marks a negative value with ▼ and a signed label', () => {
    expect(formatDelta(-4)).toEqual({ glyph: '▼', text: '-4' });
  });

  it('marks zero with – and "0"', () => {
    expect(formatDelta(0)).toEqual({ glyph: '–', text: '0' });
  });
});
