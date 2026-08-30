import { useQuery } from '@tanstack/react-query';

import type { AccessControlResponse } from '@/features/dashboard/types/accessControl.types';
import { delay } from '@/features/dashboard/api/delay';
import { accessControlFixture } from '@/features/dashboard/api/accessControl.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<AccessControlResponse>('/dashboard/access-control');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useAccessControl() {
  return useQuery({
    queryKey: ['dashboard', 'accessControl'] as const,
    queryFn: async (): Promise<AccessControlResponse> => {
      await delay(300);
      return accessControlFixture;
    },
  });
}
