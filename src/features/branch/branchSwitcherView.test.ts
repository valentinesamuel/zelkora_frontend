// Regression + invariant coverage for `selectBranchSwitcherView` (Phase 3).
//
// The bug this suite locks down: `BranchSwitcher` used to gate on React Query's
// `status === 'error'`, so a single unretried background refetch failure blanked
// a switcher whose cache was still populated (INV-B16). The pure selector below
// never receives a status flag at all — these tests structurally prove the
// decision is a function of `canRead` + `branches` + `branchId` only.

import { describe, expect, it } from 'vitest';

import type { ActiveBranch } from '@/features/branch/api/branches.api';

import { selectBranchSwitcherView } from './branchSwitcherView';

const ikeja: ActiveBranch = {
  id: 'br-ikeja',
  name: 'Ikeja',
  code: 'IKJ',
  isActive: true,
};

const lekki: ActiveBranch = {
  id: 'br-lekki',
  name: 'Lekki',
  code: 'LEK',
  isActive: true,
};

const abuja: ActiveBranch = {
  id: 'br-abuja',
  name: 'Abuja',
  code: 'ABJ',
  isActive: true,
};

describe('selectBranchSwitcherView', () => {
  it('renders a select when canRead is true and branchId matches a branch, with no status flag anywhere in the input', () => {
    const result = selectBranchSwitcherView({
      canRead: true,
      branches: [ikeja, lekki],
      branchId: 'br-ikeja',
    });

    expect(result.kind).toBe('select');
  });

  it('hides with no-permission when canRead is false even though two branches are present', () => {
    const result = selectBranchSwitcherView({
      canRead: false,
      branches: [ikeja, lekki],
      branchId: 'br-ikeja',
    });

    expect(result).toEqual({ kind: 'hidden', reason: 'no-permission' });
  });

  it('hides with no-data when the branch list is empty', () => {
    const result = selectBranchSwitcherView({
      canRead: true,
      branches: [],
      branchId: null,
    });

    expect(result).toEqual({ kind: 'hidden', reason: 'no-data' });
  });

  it('hides with single-branch when exactly one branch exists', () => {
    const result = selectBranchSwitcherView({
      canRead: true,
      branches: [ikeja],
      branchId: 'br-ikeja',
    });

    expect(result).toEqual({ kind: 'hidden', reason: 'single-branch' });
  });

  it('hides with unreconciled when branchId is null (INV-B5: waits for reconciliation, never defaults to branches[0])', () => {
    const result = selectBranchSwitcherView({
      canRead: true,
      branches: [ikeja, lekki],
      branchId: null,
    });

    expect(result).toEqual({ kind: 'hidden', reason: 'unreconciled' });
  });

  it('hides with unreconciled when branchId is a string absent from the active set', () => {
    const result = selectBranchSwitcherView({
      canRead: true,
      branches: [ikeja, lekki],
      branchId: 'dev-branch',
    });

    expect(result).toEqual({ kind: 'hidden', reason: 'unreconciled' });
  });

  it('selects the branch whose id equals branchId even when it is the SECOND row (kills `?? branches[0]`)', () => {
    const result = selectBranchSwitcherView({
      canRead: true,
      branches: [ikeja, lekki],
      branchId: 'br-lekki',
    });

    expect(result.kind).toBe('select');
    if (result.kind !== 'select') throw new Error('expected select');
    expect(result.active).toEqual(lekki);
  });

  it('treats id matching as exact `===`, so a case-only difference is unreconciled (INV-X2)', () => {
    const abc: ActiveBranch = {
      id: 'abc-123',
      name: 'ABC',
      code: 'ABC',
      isActive: true,
    };
    const xyz: ActiveBranch = {
      id: 'xyz-789',
      name: 'XYZ',
      code: 'XYZ',
      isActive: true,
    };

    const result = selectBranchSwitcherView({
      canRead: true,
      branches: [abc, xyz],
      branchId: 'ABC-123',
    });

    expect(result).toEqual({ kind: 'hidden', reason: 'unreconciled' });
  });

  it('preserves server order in the returned branches array — no client re-sort or re-filter (INV-B3)', () => {
    const serverOrder = [lekki, abuja, ikeja];

    const result = selectBranchSwitcherView({
      canRead: true,
      branches: serverOrder,
      branchId: 'br-abuja',
    });

    expect(result.kind).toBe('select');
    if (result.kind !== 'select') throw new Error('expected select');
    expect(result.branches).toBe(serverOrder);
    expect(result.branches).toEqual([lekki, abuja, ikeja]);
  });

  it('sets active to the branch whose id === branchId on the happy path (deep equality)', () => {
    const result = selectBranchSwitcherView({
      canRead: true,
      branches: [ikeja, lekki, abuja],
      branchId: 'br-ikeja',
    });

    expect(result.kind).toBe('select');
    if (result.kind !== 'select') throw new Error('expected select');
    expect(result.active).toEqual(ikeja);
  });
});
