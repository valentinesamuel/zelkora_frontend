import type { DischargeReadinessResponse } from '@/features/dashboard/types/dischargeReadiness.types';

// Static, deterministic dummy payload. 18 + 34 + 205 = 257 admitted patients;
// against ~294 staffed beds that is ≈87.4% occupancy, matching the "Inpatient
// occupancy" KPI. `readyNow` (18) is consistent with 23 patients flagged as
// awaiting discharge in dashboardKpis.fixtures.ts.
export const dischargeReadinessFixture: DischargeReadinessResponse = {
  readyNow: 18,
  readySoon: 34,
  notReady: 205,
};
