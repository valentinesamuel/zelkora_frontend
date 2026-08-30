import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { TodaysAppointmentsResponse } from '@/features/dashboard/types/todaysAppointments.types';
import { delay } from '@/features/dashboard/api/delay';
import { todaysAppointmentsFixture } from '@/features/dashboard/api/todaysAppointments.fixtures';
import { useDashboardQueryScope } from '@/features/dashboard/filters/dashboardFiltersStore';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<TodaysAppointmentsResponse>(
//     `/dashboard/appointments/today?branch=${scope.branchId}&from=${scope.from}&to=${scope.to}`,
//   );
// The `scope` values (branchId, rangeKey, from, to) are already in hand; the
// queryFn body is the only edit. Put any snake_case->camelCase transform here.
export function useTodaysAppointments() {
  const scope = useDashboardQueryScope();

  return useQuery({
    queryKey: ['dashboard', 'todaysAppointments', scope.branchId, scope.rangeKey] as const,
    queryFn: async (): Promise<TodaysAppointmentsResponse> => {
      await delay(300);
      return todaysAppointmentsFixture;
    },
    placeholderData: keepPreviousData,
  });
}
