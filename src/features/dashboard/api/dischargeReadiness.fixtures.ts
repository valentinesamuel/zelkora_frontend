import type { DischargeReadinessResponse } from '@/features/dashboard/types/dischargeReadiness.types';

// 18 + 34 + 205 = 257 admitted, ≈87.4% of ~294 beds — matches the occupancy KPI.
export const dischargeReadinessFixture: DischargeReadinessResponse = {
  readyNow: 18,
  readySoon: 34,
  notReady: 205,
};
