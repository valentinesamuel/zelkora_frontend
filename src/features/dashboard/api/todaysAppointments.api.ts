import { useQuery } from '@tanstack/react-query';

import type { TodaysAppointmentsResponse } from '@/features/dashboard/types/todaysAppointments.types';
import { delay } from '@/features/dashboard/api/delay';
import { todaysAppointmentsFixture } from '@/features/dashboard/api/todaysAppointments.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<TodaysAppointmentsResponse>('/dashboard/appointments/today');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useTodaysAppointments() {
  return useQuery({
    queryKey: ['dashboard', 'todaysAppointments'] as const,
    queryFn: async (): Promise<TodaysAppointmentsResponse> => {
      await delay(300);
      return todaysAppointmentsFixture;
    },
  });
}
