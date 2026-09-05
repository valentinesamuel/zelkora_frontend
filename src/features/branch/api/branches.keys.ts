// TanStack Query cache keys for the Branch entity.
//
// INV-Q7: `canonicalizeForKey` strips `cursor` and `withTotal` from the key so
// every page of a paginated query collapses onto the SAME cache entry (the
// entry is the logical query, not a specific page). If either leaked into the
// key, a paged query would silently refetch page 1 forever while appearing to
// work — see `patients.keys.ts` / `patients.keys.test.ts`.

import { canonicalizeForKey } from '@/lib/query';
import type { QueryState } from '@/lib/query';

const all = ['branches'] as const;

function lists() {
  return [...all, 'list'] as const;
}

function list(state: QueryState) {
  return [...lists(), canonicalizeForKey(state)] as const;
}

// Constant key for the argument-free `useActiveBranches()` hook (D8). Because
// it takes no `QueryState`, three consumers (`BranchSwitcher`, `BranchLabel`,
// the reconciliation hook) share ONE cache entry and ONE network request.
function activeList() {
  return [...lists(), 'active'] as const;
}

function details() {
  return [...all, 'detail'] as const;
}

function detail(id: string) {
  return [...details(), id] as const;
}

export const branchQueryKeys = {
  all,
  lists,
  list,
  activeList,
  details,
  detail,
};
