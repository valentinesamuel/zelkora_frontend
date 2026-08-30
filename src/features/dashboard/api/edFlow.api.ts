import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { edFlowFixture } from '@/features/dashboard/api/edFlow.fixtures';

export const useEdFlow = createDashboardQuery('edFlow', edFlowFixture);
