import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { dischargeReadinessFixture } from '@/features/dashboard/api/dischargeReadiness.fixtures';

export const useDischargeReadiness = createDashboardQuery('dischargeReadiness', dischargeReadinessFixture);
