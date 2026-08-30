import { useQuery } from '@tanstack/react-query';

import type { DischargeReadinessResponse } from '@/features/dashboard/types/dischargeReadiness.types';
import { delay } from '@/features/dashboard/api/delay';
import { dischargeReadinessFixture } from '@/features/dashboard/api/dischargeReadiness.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<DischargeReadinessResponse>('/dashboard/discharge-readiness');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useDischargeReadiness() {
  return useQuery({
    queryKey: ['dashboard', 'dischargeReadiness'] as const,
    queryFn: async (): Promise<DischargeReadinessResponse> => {
      await delay(300);
      return dischargeReadinessFixture;
    },
  });
}
