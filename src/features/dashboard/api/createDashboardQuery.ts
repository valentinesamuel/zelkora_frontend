import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: every dashboard hook resolves a static fixture after a fixed
// delay. To go live, replace the queryFn below with a call to `apiRequest<T>`
// using the scope values (branchId, rangeKey, from, to) and do any
// snake_case -> camelCase mapping there.
const FIXTURE_DELAY_MS = 300;

export function createDashboardQuery<T>(name: string, fixture: T) {
  return function useDashboardQuery() {
    const scope = useDashboardQueryScope();

    return useQuery({
      queryKey: ['dashboard', name, scope.branchId, scope.rangeKey] as const,
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, FIXTURE_DELAY_MS));
        return fixture;
      },
      placeholderData: keepPreviousData,
    });
  };
}
