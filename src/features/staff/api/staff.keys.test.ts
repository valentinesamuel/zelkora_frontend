// `branchId` is an extra key segment (not part of the canonicalized
// QueryState) — it must distinguish cache entries per branch so switching
// branch via BranchSwitcher refetches instead of showing stale cross-branch
// staff.

import { describe, expect, it } from 'vitest';

import { staffQuery } from '@/features/staff/api/staff.queryMeta';
import { staffKeys } from '@/features/staff/api/staff.keys';

describe('staffKeys', () => {
  it('all is the canonical constant tuple ["staff"]', () => {
    expect(staffKeys.all).toEqual(['staff']);
  });

  it('lists() is prefixed by all so entity-wide invalidation reaches it', () => {
    expect(staffKeys.lists()).toEqual(['staff', 'list']);
  });

  it('list() keys are prefixed by lists() so entity-wide invalidation reaches them', () => {
    const state = staffQuery().limit(25).build();
    expect(staffKeys.list(state).slice(0, 2)).toEqual(staffKeys.lists());
  });

  it('list() is stable for two structurally identical states and the same branchId', () => {
    const a = staffQuery().sort('createdAt', 'desc').limit(25).build();
    const b = staffQuery().sort('createdAt', 'desc').limit(25).build();
    expect(staffKeys.list(a, 'branch-a')).toEqual(staffKeys.list(b, 'branch-a'));
  });

  it('list() distinguishes requests for different branchIds', () => {
    const state = staffQuery().limit(25).build();
    expect(staffKeys.list(state, 'branch-a')).not.toEqual(
      staffKeys.list(state, 'branch-b'),
    );
  });

  it('list() is stable when branchId is omitted', () => {
    const state = staffQuery().limit(25).build();
    expect(staffKeys.list(state)).toEqual(staffKeys.list(state));
  });
});
