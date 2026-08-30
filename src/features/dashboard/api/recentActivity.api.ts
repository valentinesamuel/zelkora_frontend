import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { recentActivityFixture } from '@/features/dashboard/api/recentActivity.fixtures';

export const useRecentActivity = createDashboardQuery('recentActivity', recentActivityFixture);
