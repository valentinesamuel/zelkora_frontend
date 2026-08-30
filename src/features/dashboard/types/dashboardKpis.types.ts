// Contract for the dashboard KPI strip. Backend swap target: GET /dashboard/kpis
// (see api/dashboardKpis.api.ts). `display` is pre-formatted so components never
// format money/units themselves.
//
// Percentages are stored as `87.4`, NOT `0.874` — they match `formatPercent`
// (see features/dashboard/format.ts). `value` for a percentage KPI is the same
// 0–100 number.

export interface KpiItem {
  id: string;
  label: string;
  value: number;
  display: string;
  delta: number;
  deltaLabel: string;
  /** Semantic reading of the delta, decoupled from its sign — a falling ED wait
   *  is `good`. Consumed by `DeltaBadge` via `KpiCard`. */
  deltaIntent: 'good' | 'bad' | 'neutral';
  /** 7–12 point history for the KPI card sparkline. Never fewer than 2. */
  spark: number[];
}

export interface DashboardKpisResponse {
  items: KpiItem[];
}
