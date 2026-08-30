import { useQuery } from '@tanstack/react-query';

import type { EdFlowResponse } from '@/features/dashboard/types/edFlow.types';
import { delay } from '@/features/dashboard/api/delay';
import { edFlowFixture } from '@/features/dashboard/api/edFlow.fixtures';

// BACKEND SWAP: replace the queryFn body with
//   return apiRequest<EdFlowResponse>('/dashboard/ed-flow');
// Nothing else in this file changes. Put any snake_case->camelCase transform here.
export function useEdFlow() {
  return useQuery({
    queryKey: ['dashboard', 'edFlow'] as const,
    queryFn: async (): Promise<EdFlowResponse> => {
      await delay(300);
      return edFlowFixture;
    },
  });
}
