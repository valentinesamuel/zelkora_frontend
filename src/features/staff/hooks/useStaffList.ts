import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { PaginatedResult, QueryBuilder } from '@/lib/query';

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
  return useQuery<PaginatedResult<StaffListItem>>({
    queryKey: staffKeys.list(state),
    queryFn: () => staffRepository.list(state),
    placeholderData: keepPreviousData,
  });
}
