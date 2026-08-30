import { useQuery } from '@tanstack/react-query';

import type { SystemAlertsResponse } from '@/features/dashboard/types/systemAlerts.types';
import { delay } from '@/features/dashboard/api/delay';
import { systemAlertsFixture } from '@/features/dashboard/api/systemAlerts.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<SystemAlertsResponse>('/dashboard/system-alerts');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useSystemAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'systemAlerts'] as const,
    queryFn: async (): Promise<SystemAlertsResponse> => {
      await delay(300);
      return systemAlertsFixture;
    },
  });
}
