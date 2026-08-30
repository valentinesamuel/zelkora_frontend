import { useQuery } from '@tanstack/react-query';

import type { HmoClaimsResponse } from '@/features/dashboard/types/hmoClaims.types';
import { delay } from '@/features/dashboard/api/delay';
import { hmoClaimsFixture } from '@/features/dashboard/api/hmoClaims.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<HmoClaimsResponse>('/dashboard/hmo-claims');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useHmoClaims() {
  return useQuery({
    queryKey: ['dashboard', 'hmoClaims'] as const,
    queryFn: async (): Promise<HmoClaimsResponse> => {
      await delay(300);
      return hmoClaimsFixture;
    },
  });
}
