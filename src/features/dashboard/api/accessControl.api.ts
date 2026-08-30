import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { AccessControlResponse } from '@/features/dashboard/types/accessControl.types';
import { delay } from '@/features/dashboard/api/delay';
import { accessControlFixture } from '@/features/dashboard/api/accessControl.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<AccessControlResponse>(
//     `/dashboard/access-control?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useAccessControl() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'accessControl', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<AccessControlResponse> => {
      await delay(300);
      return accessControlFixture;
    },
    placeholderData: keepPreviousData,
  });
}
