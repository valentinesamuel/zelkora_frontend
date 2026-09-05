import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { PaginatedResult, QueryBuilder, QueryState } from '@/lib/query';

import {
  branchQuery,
  branchQueryMeta,
} from '@/features/branch/api/branch.queryMeta';
import { branchQueryKeys } from '@/features/branch/api/branches.keys';
import { branchesRepository } from '@/features/branch/api/branchesRepository';
import type { Branch } from '@/features/branch/types/branch.types';

export type BranchQueryBuilder<Selected extends keyof Branch & string = never> =
  QueryBuilder<Branch, typeof branchQueryMeta, Selected>;

// Result row shape for a query with a given `Selected` field set: the full
// `Branch` when nothing was `.select()`-ed, otherwise the narrowed pick —
// matching exactly what the server returns for that request.
type BranchRow<Selected extends keyof Branch & string> = [Selected] extends [
  never,
]
  ? Branch
  : Pick<Branch, Selected>;

// The projected shape the chrome needs: id (value), name (label at sm+),
// code (label below sm — D3), isActive (defensive; the filter is server-side).
type ActiveBranch = Pick<Branch, 'id' | 'name' | 'code' | 'isActive'>;

// ---------------------------------------------------------------------------
// Thin repository wrappers.
// ---------------------------------------------------------------------------

function listBranches<Selected extends keyof Branch & string = never>(
  state: QueryState,
): Promise<PaginatedResult<BranchRow<Selected>>> {
  return branchesRepository.list<BranchRow<Selected>>(state);
}

export const branchesApi = {
  list: listBranches,
  get: (id: string) => branchesRepository.get(id),
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

// Parameterised list query — the list page's hook, mirroring `usePatients`.
export function useBranches<Selected extends keyof Branch & string = never>(
  query: BranchQueryBuilder<Selected>,
) {
  const state = query.build();
  return useQuery<PaginatedResult<BranchRow<Selected>>>({
    queryKey: branchQueryKeys.list(state),
    queryFn: () => branchesApi.list<Selected>(state),
    placeholderData: keepPreviousData,
  });
}

// Fixed, argument-free query for the app chrome (D8). Its query key is
// CONSTANT (`branchQueryKeys.activeList()`), so `BranchSwitcher`,
// `BranchLabel`, and `useBranchHydration`'s reconciliation all share one
// cache entry and one network request.
//
// INV-B3: the `.where('isActive','eq',true)` lives here, server-side, and
// cannot be widened by a caller — the switcher structurally cannot list an
// inactive branch. Do NOT add a redundant client-side `.filter(b.isActive)`.
//
// INV-B7: `.limit(50)` fetches exactly ONE page and does not paginate.
// `MAX_LIMIT` in `src/lib/query/builder.ts` is 50. A deployment with >50
// ACTIVE branches would silently truncate the switcher — accepted (licensing
// caps self-hosted tiers well below this; managed deployments are low-tens).
// Escalate to a paginated/searchable combobox if a customer approaches the cap.
//
// `retry: false` (D4): `GET /branches` requires `branch:read`, which is not
// seeded for any non-admin role (H-3) — do not retry a guaranteed 403 three
// times on every page load.
//
// `enabled` (D4, Phase 4): callers pass `enabled: canRead` (from a
// `useCan(['branch:read'])` pre-flight) so a user who provably lacks the
// permission never issues the doomed request AT ALL. The query key is still
// constant, so a disabled mount adds no request and no cache entry churn.
export interface UseActiveBranchesOptions {
  readonly enabled?: boolean;
}

export function useActiveBranches(options: UseActiveBranchesOptions = {}) {
  const state = branchQuery()
    .where('isActive', 'eq', true)
    .sort('name', 'asc')
    .limit(50)
    .select('id', 'name', 'code', 'isActive')
    .build();

  return useQuery<PaginatedResult<ActiveBranch>>({
    queryKey: branchQueryKeys.activeList(),
    queryFn: () => branchesApi.list<'id' | 'name' | 'code' | 'isActive'>(state),
    staleTime: 5 * 60_000,
    retry: false,
    enabled: options.enabled ?? true,
  });
}

export function useBranch(id: string) {
  return useQuery<Branch>({
    queryKey: branchQueryKeys.detail(id),
    queryFn: () => branchesApi.get(id),
    enabled: id.length > 0,
  });
}
