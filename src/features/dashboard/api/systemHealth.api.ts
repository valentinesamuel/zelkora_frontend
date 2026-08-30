import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { systemHealthFixture } from '@/features/dashboard/api/systemHealth.fixtures';

export const useSystemHealth = createDashboardQuery(
  'systemHealth',
  systemHealthFixture,
);
