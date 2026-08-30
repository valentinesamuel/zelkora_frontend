// Revenue & billing panel payload. Backend: GET /dashboard/revenue-billing.

export interface RevenueSummary {
  totalMinor: number;
  cashMinor: number;
  hmoMinor: number;
  currency: 'NGN';
  /** Revenue target for the same period, minor units. */
  targetMinor: number;
  /** Collected / billed for the period, as a 0–100 percentage. */
  collectionsRatePct: number;
  /** Outstanding accounts-receivable balance, minor units. */
  outstandingArMinor: number;
  /** Average days a receivable stays open. */
  daysInAr: number;
  // Daily revenue history (major-unit naira); last point equals `totalMinor / 100`.
  trend: number[];
}

export interface RevenueBillingResponse {
  summary: RevenueSummary;
}
