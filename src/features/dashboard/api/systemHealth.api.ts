import { useQuery } from '@tanstack/react-query';

import type { SystemHealthResponse } from '@/features/dashboard/types/systemHealth.types';
import { delay } from '@/features/dashboard/api/delay';
import { systemHealthFixture } from '@/features/dashboard/api/systemHealth.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<SystemHealthResponse>('/dashboard/system-health');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useSystemHealth() {
  return useQuery({
    queryKey: ['dashboard', 'systemHealth'] as const,
    queryFn: async (): Promise<SystemHealthResponse> => {
      await delay(300);
      return systemHealthFixture;
    },
  });
}
