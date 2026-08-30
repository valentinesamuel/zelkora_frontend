import { useQuery } from '@tanstack/react-query';

import type { QualitySafetyResponse } from '@/features/dashboard/types/qualitySafety.types';
import { delay } from '@/features/dashboard/api/delay';
import { qualitySafetyFixture } from '@/features/dashboard/api/qualitySafety.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<QualitySafetyResponse>('/dashboard/quality-safety');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useQualitySafety() {
  return useQuery({
    queryKey: ['dashboard', 'qualitySafety'] as const,
    queryFn: async (): Promise<QualitySafetyResponse> => {
      await delay(300);
      return qualitySafetyFixture;
    },
  });
}
