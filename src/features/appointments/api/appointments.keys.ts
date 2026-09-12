// TanStack Query cache keys for the Appointment entity.
//
// INV-Q7: `canonicalizeForKey` strips `cursor` and `withTotal` from the key so
// every page of a paginated query collapses onto the SAME cache entry (the
// entry is the logical query, not a specific page). If either leaked into the
// key, a paged query would silently refetch page 1 forever while appearing to
// work — see `patients.keys.ts` / `patients.keys.test.ts`.
//
// Appointments paginate by OFFSET (page numbers), not cursor — `page`/`pageSize`
// DO belong in the key, and `canonicalizeForKey` keeps them.

import { canonicalizeForKey } from '@/lib/query';
import type { QueryState } from '@/lib/query';

const all = ['appointments'] as const;

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

export const appointmentQueryKeys = {
  all,
  lists,
  list,
  details,
  detail,
};
