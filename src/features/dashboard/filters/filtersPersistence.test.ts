import { describe, expect, it } from 'vitest';

import { DEFAULT_BRANCH_ID } from '@/features/branch/branches';

import { decodeFilters, encodeFilters } from './filtersPersistence';

const TODAY = '2026-08-30';

describe('decodeFilters — absence vs corruption', () => {
  it('null → { present: false, healed: false } and the defaults (I-32c / DE Issue C)', () => {
    const d = decodeFilters(null, TODAY);
    expect(d.present).toBe(false);
    expect(d.healed).toBe(false);
    expect(d.branchId).toBe(DEFAULT_BRANCH_ID);
    expect(d.selection).toEqual({ preset: 'today' });
  });

  it('empty string → present, healed (JSON.parse throws inside the guard)', () => {
    const d = decodeFilters('', TODAY);
    expect(d).toMatchObject({ present: true, healed: true, branchId: DEFAULT_BRANCH_ID });
    expect(d.selection).toEqual({ preset: 'today' });
  });

  it('"not json" → present, healed, no throw', () => {
    expect(decodeFilters('not json', TODAY)).toMatchObject({ present: true, healed: true });
  });

  it('"[]" (valid JSON, wrong shape) → present, healed', () => {
    expect(decodeFilters('[]', TODAY)).toMatchObject({ present: true, healed: true });
  });

  it('unrecognised version stamp → present, healed', () => {
    const raw = JSON.stringify({ v: 2, branchId: DEFAULT_BRANCH_ID, preset: 'today' });
    expect(decodeFilters(raw, TODAY)).toMatchObject({ present: true, healed: true });
  });
});

describe('decodeFilters — field-level healing', () => {
  it('unknown branchId falls back to the default and flags healed', () => {
    const raw = JSON.stringify({ v: 1, branchId: 'nope', preset: 'today' });
    const d = decodeFilters(raw, TODAY);
    expect(d.branchId).toBe(DEFAULT_BRANCH_ID);
    expect(d.present).toBe(true);
    expect(d.healed).toBe(true);
    expect(d.selection).toEqual({ preset: 'today' });
  });

  it('unknown preset heals the range but keeps a known branch', () => {
    const raw = JSON.stringify({ v: 1, branchId: 'branch-lekki', preset: 'weekly' });
    const d = decodeFilters(raw, TODAY);
    expect(d.branchId).toBe('branch-lekki');
    expect(d.healed).toBe(true);
    expect(d.selection).toEqual({ preset: 'today' });
  });

  it('a future custom window is clamped and flagged healed', () => {
    const raw = JSON.stringify({
      v: 1,
      branchId: 'branch-lekki',
      preset: 'custom',
      from: '2026-12-01',
      to: '2026-12-31',
    });
    const d = decodeFilters(raw, TODAY);
    expect(d.healed).toBe(true);
    expect(d.selection).toEqual({ preset: 'custom', from: '2026-08-30', to: '2026-08-30' });
  });
});

describe('decodeFilters — a clean stored value', () => {
  it('a valid preset blob round-trips with healed === false', () => {
    const raw = JSON.stringify({ v: 1, branchId: 'branch-abuja', preset: 'last7' });
    const d = decodeFilters(raw, TODAY);
    expect(d).toEqual({
      branchId: 'branch-abuja',
      selection: { preset: 'last7' },
      present: true,
      healed: false,
    });
  });

  it('a valid custom blob round-trips with healed === false', () => {
    const raw = JSON.stringify({
      v: 1,
      branchId: 'branch-abuja',
      preset: 'custom',
      from: '2026-03-03',
      to: '2026-03-09',
    });
    const d = decodeFilters(raw, TODAY);
    expect(d.healed).toBe(false);
    expect(d.selection).toEqual({ preset: 'custom', from: '2026-03-03', to: '2026-03-09' });
  });
});

describe('encodeFilters ∘ decodeFilters fidelity', () => {
  it('preset selection survives a round-trip', () => {
    const encoded = encodeFilters('branch-ikeja', { preset: 'quarter' });
    const d = decodeFilters(encoded, TODAY);
    expect(d.branchId).toBe('branch-ikeja');
    expect(d.selection).toEqual({ preset: 'quarter' });
    expect(d.healed).toBe(false);
  });

  it('custom selection survives a round-trip', () => {
    const selection = { preset: 'custom' as const, from: '2026-02-10', to: '2026-02-20' };
    const encoded = encodeFilters('branch-lekki', selection);
    const d = decodeFilters(encoded, TODAY);
    expect(d.branchId).toBe('branch-lekki');
    expect(d.selection).toEqual(selection);
    expect(d.healed).toBe(false);
  });

  it('a non-custom selection does not serialise from/to', () => {
    const encoded = encodeFilters('dev-branch', { preset: 'ytd', from: '2026-01-01', to: '2026-02-01' });
    expect(encoded).toBe('{"v":1,"branchId":"dev-branch","preset":"ytd"}');
  });
});
