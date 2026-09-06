// D8: `useActiveBranches()` is argument-free so `BranchSwitcher`, `BranchLabel`,
// and `useBranchHydration`'s reconciliation all share ONE cache entry and ONE
// network request. That only holds if `branchQueryKeys.activeList()` is a
// constant — this suite locks the exact tuple and its stability.

import { describe, expect, it } from 'vitest';

import { branchQueryKeys } from '@/features/branch/api/branches.keys';

describe('branchQueryKeys', () => {
  it('activeList() is the canonical constant tuple ["branches","list","active"]', () => {
    expect(branchQueryKeys.activeList()).toEqual([
      'branches',
      'list',
      'active',
    ]);
  });

  it('activeList() is argument-free and stable — one key for three consumers (D8)', () => {
    expect(branchQueryKeys.activeList()).toEqual(branchQueryKeys.activeList());
  });

  it('activeList() is prefixed by lists() so entity-wide invalidation still reaches it', () => {
    expect(branchQueryKeys.activeList().slice(0, 2)).toEqual(
      branchQueryKeys.lists(),
    );
  });

  it('detail() keys are stable per id', () => {
    expect(branchQueryKeys.detail('abc')).toEqual([
      'branches',
      'detail',
      'abc',
    ]);
  });
});
