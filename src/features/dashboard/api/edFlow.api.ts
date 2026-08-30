import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { EdFlowResponse } from '@/features/dashboard/types/edFlow.types';
import { delay } from '@/features/dashboard/api/delay';
import { edFlowFixture } from '@/features/dashboard/api/edFlow.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<EdFlowResponse>(
//     `/dashboard/ed-flow?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useEdFlow() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'edFlow', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<EdFlowResponse> => {
      await delay(300);
      return edFlowFixture;
    },
    placeholderData: keepPreviousData,
  });
}
