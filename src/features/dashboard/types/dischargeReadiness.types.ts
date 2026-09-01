// Discharge-readiness donut payload. Backend: GET /dashboard/discharge-readiness.
// Counts of currently-admitted patients by readiness.

export interface DischargeReadinessResponse {
  // Medically cleared, discharge can proceed now.
  readyNow: number;
  // Expected ready within 24h.
  readySoon: number;
  // Not ready for discharge.
  notReady: number;
}
