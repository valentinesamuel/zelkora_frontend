import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { RevenueBillingResponse } from '@/features/dashboard/types/revenueBilling.types';
import { delay } from '@/features/dashboard/api/delay';
import { revenueBillingFixture } from '@/features/dashboard/api/revenueBilling.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<RevenueBillingResponse>(
//     `/dashboard/revenue-billing?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useRevenueBilling() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'revenueBilling', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<RevenueBillingResponse> => {
      await delay(300);
      return revenueBillingFixture;
    },
    placeholderData: keepPreviousData,
  });
}
