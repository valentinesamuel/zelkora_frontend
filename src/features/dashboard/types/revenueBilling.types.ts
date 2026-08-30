// Contract for the revenue & billing panel. Backend swap target:
// GET /dashboard/revenue-billing (see api/revenueBilling.api.ts).
// All money fields are minor units (kobo), suffixed `*Minor`.
// Percentages are stored as 0–100 numbers (e.g. 91.9), matching `formatPercent`.

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
  /** Daily revenue history (major-unit naira) for the summary sparkline; the
   *  last point equals `totalMinor / 100`. Never fewer than 2 points. */
  trend: number[];
}

export interface RevenueBillingResponse {
  summary: RevenueSummary;
}
