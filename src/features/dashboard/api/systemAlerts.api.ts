import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { SystemAlertsResponse } from '@/features/dashboard/types/systemAlerts.types';
import { delay } from '@/features/dashboard/api/delay';
import { systemAlertsFixture } from '@/features/dashboard/api/systemAlerts.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<SystemAlertsResponse>(
//     `/dashboard/system-alerts?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useSystemAlerts() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'systemAlerts', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<SystemAlertsResponse> => {
      await delay(300);
      return systemAlertsFixture;
    },
    placeholderData: keepPreviousData,
  });
}
