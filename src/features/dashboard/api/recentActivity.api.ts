import { useQuery } from '@tanstack/react-query';

import type { RecentActivityResponse } from '@/features/dashboard/types/recentActivity.types';
import { delay } from '@/features/dashboard/api/delay';
import { recentActivityFixture } from '@/features/dashboard/api/recentActivity.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<RecentActivityResponse>('/dashboard/recent-activity');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recentActivity'] as const,
    queryFn: async (): Promise<RecentActivityResponse> => {
      await delay(300);
      return recentActivityFixture;
    },
  });
}
