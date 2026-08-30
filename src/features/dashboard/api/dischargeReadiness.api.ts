import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { DischargeReadinessResponse } from '@/features/dashboard/types/dischargeReadiness.types';
import { delay } from '@/features/dashboard/api/delay';
import { dischargeReadinessFixture } from '@/features/dashboard/api/dischargeReadiness.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<DischargeReadinessResponse>(
//     `/dashboard/discharge-readiness?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useDischargeReadiness() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'dischargeReadiness', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<DischargeReadinessResponse> => {
      await delay(300);
      return dischargeReadinessFixture;
    },
    placeholderData: keepPreviousData,
  });
}
