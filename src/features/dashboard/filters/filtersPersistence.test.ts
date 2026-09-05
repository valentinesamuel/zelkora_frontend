// Rewritten for Phase 3 (D1 Option A): `decodeFilters` no longer knows branch
// IDENTITY. It validates only the SHAPE of `branchId` and returns
// `string | null`; repairing a stale/legacy id is `useBranchHydration`'s job
// (reconciliation, INV-B5). Consequently branch identity NO LONGER participates
// in `healed`, and `null` is serialised by OMITTING the key.
//
// The old suite imported `DEFAULT_BRANCH_ID` and asserted the fabricated ids
// `dev-branch` / `branch-ikeja` / `branch-lekki` / `branch-abuja`. All of that
// is gone.

import { describe, expect, it } from 'vitest';

import { decodeFilters, encodeFilters } from './filtersPersistence';

const TODAY = '2026-08-30';

describe('decodeFilters — absence vs corruption', () => {
  it('null → { present: false, healed: false }, branchId null, default range', () => {
    const d = decodeFilters(null, TODAY);
    expect(d.present).toBe(false);
    expect(d.healed).toBe(false);
    expect(d.branchId).toBeNull();
    expect(d.selection).toEqual({ preset: 'today' });
  });

  it('empty string → present, healed (JSON.parse throws inside the guard)', () => {
    const d = decodeFilters('', TODAY);
    expect(d).toMatchObject({ present: true, healed: true, branchId: null });
    expect(d.selection).toEqual({ preset: 'today' });
  });

  it('"not json" → present, healed, no throw', () => {
    expect(decodeFilters('not json', TODAY)).toMatchObject({
      present: true,
      healed: true,
      branchId: null,
    });
  });

  it('"[]" (valid JSON, wrong shape) → present, healed', () => {
    expect(decodeFilters('[]', TODAY)).toMatchObject({
      present: true,
      healed: true,
      branchId: null,
    });
  });

  it('unrecognised version stamp → present, healed, branchId null', () => {
    const raw = JSON.stringify({ v: 2, branchId: 'anything', preset: 'today' });
    expect(decodeFilters(raw, TODAY)).toMatchObject({
      present: true,
      healed: true,
      branchId: null,
    });
  });
});

describe('decodeFilters — branchId is structural only, never healed', () => {
  it('any non-empty string passes through verbatim and does NOT flag healed', () => {
    const raw = '{"v":1,"branchId":"anything","preset":"today"}';
    const d = decodeFilters(raw, TODAY);
    expect(d.branchId).toBe('anything');
    expect(d.healed).toBe(false);
    expect(d.present).toBe(true);
  });

  it('a legacy fabricated id is preserved as-is (reconciliation repairs it later)', () => {
    const raw = JSON.stringify({
      v: 1,
      branchId: 'dev-branch',
      preset: 'today',
    });
    const d = decodeFilters(raw, TODAY);
    expect(d.branchId).toBe('dev-branch');
    expect(d.healed).toBe(false);
  });

  it('empty-string branchId → null, without flagging healed', () => {
    const raw = JSON.stringify({ v: 1, branchId: '', preset: 'today' });
    const d = decodeFilters(raw, TODAY);
    expect(d.branchId).toBeNull();
    expect(d.healed).toBe(false);
  });

  it('non-string branchId → null, without flagging healed', () => {
    const raw = '{"v":1,"branchId":123,"preset":"today"}';
    const d = decodeFilters(raw, TODAY);
    expect(d.branchId).toBeNull();
    expect(d.healed).toBe(false);
  });

  it('absent branchId → null, without flagging healed', () => {
    const raw = JSON.stringify({ v: 1, preset: 'last7' });
    const d = decodeFilters(raw, TODAY);
    expect(d.branchId).toBeNull();
    expect(d.healed).toBe(false);
    expect(d.selection).toEqual({ preset: 'last7' });
  });
});

describe('decodeFilters — range healing (branch-independent)', () => {
  it('unknown preset heals the range but leaves branchId untouched', () => {
    const raw = JSON.stringify({
      v: 1,
      branchId: 'branch-lekki',
      preset: 'weekly',
    });
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
    expect(d.selection).toEqual({
      preset: 'custom',
      from: '2026-08-30',
      to: '2026-08-30',
    });
  });
});

describe('decodeFilters — a clean stored value', () => {
  it('a valid preset blob round-trips with healed === false', () => {
    const raw = JSON.stringify({
      v: 1,
      branchId: 'branch-abuja',
      preset: 'last7',
    });
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
    expect(d.selection).toEqual({
      preset: 'custom',
      from: '2026-03-03',
      to: '2026-03-09',
    });
  });
});

describe('encodeFilters', () => {
  it('omits the branchId key entirely when branchId is null', () => {
    const encoded = encodeFilters(null, { preset: 'today' });
    expect(encoded).not.toContain('branchId');
    expect(encoded).toBe('{"v":1,"preset":"today"}');
  });

  it('includes branchId when it is a string', () => {
    const encoded = encodeFilters('branch-x', { preset: 'ytd' });
    expect(JSON.parse(encoded)).toEqual({
      v: 1,
      preset: 'ytd',
      branchId: 'branch-x',
    });
  });

  it('a non-custom selection does not serialise from/to', () => {
    const encoded = encodeFilters('dev-branch', {
      preset: 'ytd',
      from: '2026-01-01',
      to: '2026-02-01',
    });
    expect(JSON.parse(encoded)).toEqual({
      v: 1,
      preset: 'ytd',
      branchId: 'dev-branch',
    });
  });
});

describe('encodeFilters ∘ decodeFilters fidelity', () => {
  it('preset selection + branchId survive a round-trip', () => {
    const encoded = encodeFilters('branch-ikeja', { preset: 'quarter' });
    const d = decodeFilters(encoded, TODAY);
    expect(d.branchId).toBe('branch-ikeja');
    expect(d.selection).toEqual({ preset: 'quarter' });
    expect(d.healed).toBe(false);
  });

  it('custom selection survives a round-trip', () => {
    const selection = {
      preset: 'custom' as const,
      from: '2026-02-10',
      to: '2026-02-20',
    };
    const encoded = encodeFilters('branch-lekki', selection);
    const d = decodeFilters(encoded, TODAY);
    expect(d.branchId).toBe('branch-lekki');
    expect(d.selection).toEqual(selection);
    expect(d.healed).toBe(false);
  });

  it('a null branchId round-trips back to null', () => {
    const encoded = encodeFilters(null, { preset: 'last30' });
    const d = decodeFilters(encoded, TODAY);
    expect(d.branchId).toBeNull();
    expect(d.selection).toEqual({ preset: 'last30' });
    expect(d.healed).toBe(false);
  });
});
