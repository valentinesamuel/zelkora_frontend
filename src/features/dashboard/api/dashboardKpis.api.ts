import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { DashboardKpisResponse } from '@/features/dashboard/types/dashboardKpis.types';
import { delay } from '@/features/dashboard/api/delay';
import { dashboardKpisFixture } from '@/features/dashboard/api/dashboardKpis.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<DashboardKpisResponse>(
//     `/dashboard/kpis?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useDashboardKpis() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'dashboardKpis', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<DashboardKpisResponse> => {
      await delay(300);
      return dashboardKpisFixture;
    },
    placeholderData: keepPreviousData,
  });
}
