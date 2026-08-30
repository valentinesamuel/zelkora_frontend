import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { QualitySafetyResponse } from '@/features/dashboard/types/qualitySafety.types';
import { delay } from '@/features/dashboard/api/delay';
import { qualitySafetyFixture } from '@/features/dashboard/api/qualitySafety.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<QualitySafetyResponse>(
//     `/dashboard/quality-safety?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useQualitySafety() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'qualitySafety', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<QualitySafetyResponse> => {
      await delay(300);
      return qualitySafetyFixture;
    },
    placeholderData: keepPreviousData,
  });
}
