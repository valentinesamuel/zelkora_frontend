// ED volume & wait-time chart payload. Backend: GET /dashboard/ed-flow.
// One point per day: patient visits and average wait in minutes.

export interface EdFlowPoint {
  day: string;
  visits: number;
  avgWaitMin: number;
}

export interface EdFlowResponse {
  points: EdFlowPoint[];
}
