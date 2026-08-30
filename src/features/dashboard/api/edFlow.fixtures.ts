import type { EdFlowResponse } from '@/features/dashboard/types/edFlow.types';

// Static, deterministic dummy payload: one rolling week of ED activity. Wait
// climbs with volume mid-week; the final day's `avgWaitMin` (42) matches the
// "ED average wait" KPI in dashboardKpis.fixtures.ts.
export const edFlowFixture: EdFlowResponse = {
  points: [
    { day: 'Mon', visits: 168, avgWaitMin: 38 },
    { day: 'Tue', visits: 182, avgWaitMin: 41 },
    { day: 'Wed', visits: 175, avgWaitMin: 39 },
    { day: 'Thu', visits: 194, avgWaitMin: 45 },
    { day: 'Fri', visits: 213, avgWaitMin: 48 },
    { day: 'Sat', visits: 201, avgWaitMin: 44 },
    { day: 'Sun', visits: 166, avgWaitMin: 42 },
  ],
};
