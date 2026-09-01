import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { dashboardKpisFixture } from '@/features/dashboard/api/dashboardKpis.fixtures';

export const useDashboardKpis = createDashboardQuery(
  'dashboardKpis',
  dashboardKpisFixture,
);
