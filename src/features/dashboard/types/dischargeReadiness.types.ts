// Contract for the discharge-readiness donut. Backend swap target:
// GET /dashboard/discharge-readiness (see api/dischargeReadiness.api.ts).
// Counts of currently-admitted patients by discharge readiness.

export interface DischargeReadinessResponse {
  /** Medically cleared, discharge can proceed now. */
  readyNow: number;
  /** Expected ready within 24h. */
  readySoon: number;
  /** Not ready for discharge. */
  notReady: number;
}
