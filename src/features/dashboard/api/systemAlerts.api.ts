import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { systemAlertsFixture } from '@/features/dashboard/api/systemAlerts.fixtures';

export const useSystemAlerts = createDashboardQuery(
  'systemAlerts',
  systemAlertsFixture,
);
