import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { PaginatedResult, QueryBuilder } from '@/lib/query';

import { isAdmin } from '@/features/auth/isAdmin';
import { useAuthStore } from '@/features/auth/authStore';
import { resolveBranchScopeParam } from '@/features/branch/resolveBranchScopeParam';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';
import { staffQueryMeta } from '@/features/staff/api/staff.queryMeta';
import { staffKeys } from '@/features/staff/api/staff.keys';
import { staffRepository } from '@/features/staff/api/staffRepository';
import type { StaffListItem } from '@/features/staff/types/staff.types';

export type StaffQueryBuilder = QueryBuilder<
  StaffListItem,
  typeof staffQueryMeta
>;

// Parameterised list query — mirrors `useBranches`: takes a built query builder,
// calls `.build()`, and keeps the previous page visible while the next loads.
export function useStaffList(query: StaffQueryBuilder) {
  const state = query.build();
  const user = useAuthStore((s) => s.user);
  const storeBranchId = useDashboardFiltersStore((s) => s.branchId);
  const admin = isAdmin(user);
  const branchId = resolveBranchScopeParam(admin, storeBranchId);

  return useQuery<PaginatedResult<StaffListItem>>({
    queryKey: staffKeys.list(state, branchId),
    queryFn: () => staffRepository.list(state, branchId),
    // Admin requests require a branchId server-side; disable rather than
    // send a request guaranteed to 400 during the brief window before
    // `useBranchHydration` resolves the active branch (INV-B11).
    enabled: !admin || branchId !== undefined,
    placeholderData: keepPreviousData,
  });
}
