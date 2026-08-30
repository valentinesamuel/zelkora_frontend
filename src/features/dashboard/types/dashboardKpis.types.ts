// KPI strip payload. Backend: GET /dashboard/kpis. `display` is pre-formatted so
// components never format money or units themselves.

export interface KpiItem {
  id: string;
  label: string;
  value: number;
  display: string;
  delta: number;
  deltaLabel: string;
  // Semantic reading of the delta, not its sign — a falling ED wait is `good`.
  deltaIntent: 'good' | 'bad' | 'neutral';
  // KPI card sparkline history; never fewer than 2 points.
  spark: number[];
}

export interface DashboardKpisResponse {
  items: KpiItem[];
}
