import { useQuery } from '@tanstack/react-query';

import type { RevenueBillingResponse } from '@/features/dashboard/types/revenueBilling.types';
import { delay } from '@/features/dashboard/api/delay';
import { revenueBillingFixture } from '@/features/dashboard/api/revenueBilling.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<RevenueBillingResponse>('/dashboard/revenue-billing');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useRevenueBilling() {
  return useQuery({
    queryKey: ['dashboard', 'revenueBilling'] as const,
    queryFn: async (): Promise<RevenueBillingResponse> => {
      await delay(300);
      return revenueBillingFixture;
    },
  });
}
