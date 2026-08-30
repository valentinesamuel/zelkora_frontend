// Contract for the HMO claims panel. Backend swap target:
// GET /dashboard/hmo-claims (see api/hmoClaims.api.ts).
// Money fields are minor units (kobo), suffixed `*Minor`.
// Percentages are stored as 0–100 numbers (e.g. 12.5), matching `formatPercent`.

export type HmoClaimStatus = 'submitted' | 'pending' | 'approved' | 'denied';

export interface HmoClaimsSummary {
  pendingCount: number;
  deniedCount: number;
  submittedValueMinor: number;
  /** Denied / adjudicated claims, as a 0–100 percentage. */
  denialRatePct: number;
  /** Average days from submission to adjudication. */
  daysToAdjudication: number;
}

export interface HmoClaim {
  id: string;
  hmoName: string;
  patientName: string;
  amountMinor: number;
  status: HmoClaimStatus;
  statusLabel: string;
  submittedAt: string;
}

export interface HmoClaimsResponse {
  summary: HmoClaimsSummary;
  claims: HmoClaim[];
}
