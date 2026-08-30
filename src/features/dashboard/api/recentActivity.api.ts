import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { RecentActivityResponse } from '@/features/dashboard/types/recentActivity.types';
import { delay } from '@/features/dashboard/api/delay';
import { recentActivityFixture } from '@/features/dashboard/api/recentActivity.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<RecentActivityResponse>(
//     `/dashboard/recent-activity?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useRecentActivity() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'recentActivity', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<RecentActivityResponse> => {
      await delay(300);
      return recentActivityFixture;
    },
    placeholderData: keepPreviousData,
  });
}
