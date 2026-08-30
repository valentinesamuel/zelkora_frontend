// HMO claims panel payload. Backend: GET /dashboard/hmo-claims.

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
