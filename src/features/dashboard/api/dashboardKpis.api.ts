import { useQuery } from '@tanstack/react-query';

import type { DashboardKpisResponse } from '@/features/dashboard/types/dashboardKpis.types';
import { delay } from '@/features/dashboard/api/delay';
import { dashboardKpisFixture } from '@/features/dashboard/api/dashboardKpis.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<DashboardKpisResponse>('/dashboard/kpis');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'dashboardKpis'] as const,
    queryFn: async (): Promise<DashboardKpisResponse> => {
      await delay(300);
      return dashboardKpisFixture;
    },
  });
}
