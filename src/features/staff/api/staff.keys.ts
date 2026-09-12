// TanStack Query cache keys for the Staff entity.
//
// INV-Q7: `canonicalizeForKey` strips `cursor` and `withTotal` from the key so
// every page of a paginated query collapses onto the SAME cache entry (the
// entry is the logical query, not a specific page).

import { canonicalizeForKey } from '@/lib/query';
import type { QueryState } from '@/lib/query';

const all = ['staff'] as const;

function me() {
  return [...all, 'me'] as const;
}

function lists() {
  return [...all, 'list'] as const;
}

function list(state: QueryState, branchId?: string) {
  return [...lists(), canonicalizeForKey(state), branchId ?? null] as const;
}

function details() {
  return [...all, 'detail'] as const;
}

function detail(id: string) {
  return [...details(), id] as const;
}

function departments() {
  return [...all, 'departments'] as const;
}

// Top-level, NOT under `staff` — `GET /auth/roles` is an auth resource shared
// beyond this feature.
function roles() {
  return ['roles'] as const;
}

export const staffKeys = {
  all,
  me,
  lists,
  list,
  details,
  detail,
  departments,
  roles,
};
