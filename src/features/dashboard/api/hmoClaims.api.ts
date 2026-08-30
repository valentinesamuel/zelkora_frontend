import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { HmoClaimsResponse } from '@/features/dashboard/types/hmoClaims.types';
import { delay } from '@/features/dashboard/api/delay';
import { hmoClaimsFixture } from '@/features/dashboard/api/hmoClaims.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<HmoClaimsResponse>(
//     `/dashboard/hmo-claims?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useHmoClaims() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'hmoClaims', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<HmoClaimsResponse> => {
      await delay(300);
      return hmoClaimsFixture;
    },
    placeholderData: keepPreviousData,
  });
}
