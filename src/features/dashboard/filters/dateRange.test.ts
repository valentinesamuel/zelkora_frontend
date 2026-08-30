import { describe, expect, it } from 'vitest';

import {
  MAX_RANGE_DAYS,
  normalizeSelection,
  resolveRange,
  type RangeSelection,
} from './dateRange';

// `today` is pinned to a fixed literal on the happy path, deliberately NOT near
// a month / quarter / year edge. Edge behaviour has its own dated cases.
const TODAY = '2026-08-30';

describe('resolveRange — presets', () => {
  it('today → from === to === today', () => {
    expect(resolveRange({ preset: 'today' }, TODAY)).toEqual({
      from: '2026-08-30',
      to: '2026-08-30',
      rangeKey: '2026-08-30_2026-08-30',
      label: 'Today',
    });
  });

  it('last7 → today − 6d, inclusive of today', () => {
    expect(resolveRange({ preset: 'last7' }, TODAY)).toEqual({
      from: '2026-08-24',
      to: '2026-08-30',
      rangeKey: '2026-08-24_2026-08-30',
      label: 'Last 7 days',
    });
  });

  it('last30 → today − 29d', () => {
    expect(resolveRange({ preset: 'last30' }, TODAY)).toEqual({
      from: '2026-08-01',
      to: '2026-08-30',
      rangeKey: '2026-08-01_2026-08-30',
      label: 'Last 30 days',
    });
  });

  it('last90 → today − 89d', () => {
    expect(resolveRange({ preset: 'last90' }, TODAY)).toEqual({
      from: '2026-06-02',
      to: '2026-08-30',
      rangeKey: '2026-06-02_2026-08-30',
      label: 'Last 90 days',
    });
  });

  it('quarter → startOfQuarter(today) .. today (quarter to date)', () => {
    expect(resolveRange({ preset: 'quarter' }, TODAY)).toEqual({
      from: '2026-07-01',
      to: '2026-08-30',
      rangeKey: '2026-07-01_2026-08-30',
      label: 'This quarter',
    });
  });

  it('ytd → startOfYear(today) .. today', () => {
    expect(resolveRange({ preset: 'ytd' }, TODAY)).toEqual({
      from: '2026-01-01',
      to: '2026-08-30',
      rangeKey: '2026-01-01_2026-08-30',
      label: 'Year to date',
    });
  });
});

describe('resolveRange — quarter boundaries (F1-f)', () => {
  it('first day of Q3 → from === to', () => {
    const r = resolveRange({ preset: 'quarter' }, '2026-07-01');
    expect(r.from).toBe('2026-07-01');
    expect(r.to).toBe('2026-07-01');
  });

  it('last day of Q2 → from is 2026-04-01', () => {
    const r = resolveRange({ preset: 'quarter' }, '2026-06-30');
    expect(r.from).toBe('2026-04-01');
    expect(r.to).toBe('2026-06-30');
  });
});

describe('resolveRange — YTD boundaries', () => {
  it('Jan 1 → from === to', () => {
    const r = resolveRange({ preset: 'ytd' }, '2026-01-01');
    expect(r.from).toBe('2026-01-01');
    expect(r.to).toBe('2026-01-01');
  });

  it('Dec 31 → whole year', () => {
    const r = resolveRange({ preset: 'ytd' }, '2026-12-31');
    expect(r.from).toBe('2026-01-01');
    expect(r.to).toBe('2026-12-31');
  });
});

describe('resolveRange — month / year boundary crossings', () => {
  it('last7 crossing a year boundary (today = 2026-01-03)', () => {
    expect(resolveRange({ preset: 'last7' }, '2026-01-03').from).toBe(
      '2025-12-28',
    );
  });

  it('last30 crossing a month + year boundary', () => {
    expect(resolveRange({ preset: 'last30' }, '2026-01-03').from).toBe(
      '2025-12-05',
    );
  });

  it('last90 crossing a year boundary', () => {
    expect(resolveRange({ preset: 'last90' }, '2026-01-03').from).toBe(
      '2025-10-06',
    );
  });

  it('last7 across a leap-year February (today = 2028-03-01)', () => {
    expect(resolveRange({ preset: 'last7' }, '2028-03-01').from).toBe(
      '2028-02-24',
    );
  });
});

describe('resolveRange — custom', () => {
  it('happy path — bounds pass through, label uses an en-dash, no year in today’s year', () => {
    const r = resolveRange(
      { preset: 'custom', from: '2026-03-03', to: '2026-03-09' },
      TODAY,
    );
    expect(r).toEqual({
      from: '2026-03-03',
      to: '2026-03-09',
      rangeKey: '2026-03-03_2026-03-09',
      label: 'Mar 3 – Mar 9',
    });
  });

  it('single-day custom renders one date, not "Mar 3 – Mar 3"', () => {
    const r = resolveRange(
      { preset: 'custom', from: '2026-03-03', to: '2026-03-03' },
      TODAY,
    );
    expect(r.label).toBe('Mar 3');
  });

  it('custom outside today’s year appends the year', () => {
    const r = resolveRange(
      { preset: 'custom', from: '2025-11-20', to: '2025-12-05' },
      TODAY,
    );
    expect(r.label).toBe('Nov 20 – Dec 5 2025');
  });

  it('malformed custom bounds degrade to today rather than throwing', () => {
    const r = resolveRange(
      { preset: 'custom', from: 'nope', to: '2026-03-09' },
      TODAY,
    );
    expect(r.from).toBe('2026-08-30');
    expect(r.to).toBe('2026-08-30');
  });
});

describe('normalizeSelection — self-heal ladder', () => {
  it('null → { preset: "today" }', () => {
    expect(normalizeSelection(null, TODAY)).toEqual({ preset: 'today' });
  });

  it('undefined → { preset: "today" }', () => {
    expect(normalizeSelection(undefined, TODAY)).toEqual({ preset: 'today' });
  });

  it('parsed "{}" junk → { preset: "today" }', () => {
    expect(normalizeSelection(JSON.parse('{}'), TODAY)).toEqual({
      preset: 'today',
    });
  });

  it('unknown preset → { preset: "today" }', () => {
    expect(normalizeSelection({ preset: 'weekly' }, TODAY)).toEqual({
      preset: 'today',
    });
  });

  it('non-custom preset drops stray from/to', () => {
    expect(
      normalizeSelection(
        { preset: 'last7', from: '2026-01-01', to: '2026-02-01' },
        TODAY,
      ),
    ).toEqual({ preset: 'last7' });
  });

  it('custom with a garbage bound → { preset: "today" }', () => {
    expect(
      normalizeSelection(
        { preset: 'custom', from: 'garbage', to: '2026-03-09' },
        TODAY,
      ),
    ).toEqual({ preset: 'today' });
  });

  it('custom reversed → swapped, still custom', () => {
    expect(
      normalizeSelection(
        { preset: 'custom', from: '2026-03-09', to: '2026-03-03' },
        TODAY,
      ),
    ).toEqual({ preset: 'custom', from: '2026-03-03', to: '2026-03-09' });
  });

  it('custom entirely in the future → clamped to today', () => {
    expect(
      normalizeSelection(
        { preset: 'custom', from: '2026-12-01', to: '2026-12-31' },
        TODAY,
      ),
    ).toEqual({ preset: 'custom', from: '2026-08-30', to: '2026-08-30' });
  });

  it('custom with only `to` in the future → `to` clamped, `from` kept', () => {
    expect(
      normalizeSelection(
        { preset: 'custom', from: '2026-08-01', to: '2026-12-31' },
        TODAY,
      ),
    ).toEqual({ preset: 'custom', from: '2026-08-01', to: '2026-08-30' });
  });

  it('custom oversized → from clamped to MAX_RANGE_DAYS window', () => {
    const n = normalizeSelection(
      { preset: 'custom', from: '2020-01-01', to: '2026-08-30' },
      TODAY,
    );
    expect(n).toEqual({
      preset: 'custom',
      from: '2025-08-30',
      to: '2026-08-30',
    });
  });

  it('is idempotent — n(n(x)) === n(x)', () => {
    const inputs: unknown[] = [
      null,
      { preset: 'today' },
      { preset: 'weekly' },
      { preset: 'last30', from: '2026-01-01' },
      { preset: 'custom', from: '2026-03-09', to: '2026-03-03' },
      { preset: 'custom', from: '2026-12-01', to: '2026-12-31' },
      { preset: 'custom', from: '2020-01-01', to: '2026-08-30' },
      { preset: 'custom', from: 'garbage', to: '2026-03-09' },
    ];
    for (const input of inputs) {
      const once = normalizeSelection(input, TODAY);
      const twice = normalizeSelection(once, TODAY);
      expect(twice).toEqual(once);
    }
  });
});

describe('MAX_RANGE_DAYS (F1-i) — the clamp never truncates a legitimate preset', () => {
  it('YTD on Dec 31 of a leap year is exactly 366 days and is not clamped', () => {
    const r = resolveRange({ preset: 'ytd' }, '2028-12-31');
    expect(r.from).toBe('2028-01-01');
    expect(r.to).toBe('2028-12-31');
    // normalizing the resolved window as a custom range must leave it untouched
    const asCustom: RangeSelection = {
      preset: 'custom',
      from: r.from,
      to: r.to,
    };
    expect(normalizeSelection(asCustom, '2028-12-31')).toEqual(asCustom);
  });

  it('MAX_RANGE_DAYS is 366', () => {
    expect(MAX_RANGE_DAYS).toBe(366);
  });
});
