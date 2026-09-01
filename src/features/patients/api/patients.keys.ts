// TanStack Query cache keys for the Patient entity.
//
// R-4 / INV-Q7: `canonicalizeForKey` strips `cursor` and `withTotal` from the
// key so every page of a cursor-paginated / infinite query collapses onto the
// SAME cache entry (the entry is the logical query, not a specific page). If
// either leaked into the key, `useInfiniteQuery` would silently refetch page 1
// forever while appearing to work — see `patients.keys.test.ts`.

import { canonicalizeForKey } from '@/lib/query';
import type { QueryState } from '@/lib/query';

const all = ['patients'] as const;

function lists() {
  return [...all, 'list'] as const;
}

function list(state: QueryState) {
  return [...lists(), canonicalizeForKey(state)] as const;
}

function infinite(state: QueryState) {
  return [...lists(), 'infinite', canonicalizeForKey(state)] as const;
}

function details() {
  return [...all, 'detail'] as const;
}

function detail(id: string) {
  return [...details(), id] as const;
}

export const patientQueryKeys = {
  all,
  lists,
  list,
  infinite,
  details,
  detail,
};
