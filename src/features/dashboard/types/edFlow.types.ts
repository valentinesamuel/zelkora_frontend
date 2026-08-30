// Contract for the ED volume & wait-time chart. Backend swap target:
// GET /dashboard/ed-flow (see api/edFlow.api.ts).
// One point per day: patient visits and the average wait in minutes.

export interface EdFlowPoint {
  day: string;
  visits: number;
  avgWaitMin: number;
}

export interface EdFlowResponse {
  points: EdFlowPoint[];
}
