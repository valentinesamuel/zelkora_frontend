import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { SystemHealthResponse } from '@/features/dashboard/types/systemHealth.types';
import { delay } from '@/features/dashboard/api/delay';
import { systemHealthFixture } from '@/features/dashboard/api/systemHealth.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<SystemHealthResponse>(
//     `/dashboard/system-health?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useSystemHealth() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'systemHealth', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<SystemHealthResponse> => {
      await delay(300);
      return systemHealthFixture;
    },
    placeholderData: keepPreviousData,
  });
}
