// Contract for the system alerts feed. Backend swap target:
// GET /dashboard/system-alerts (see api/systemAlerts.api.ts).

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SystemAlert {
  id: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  severityLabel: string;
  createdAt: string;
}

export interface SystemAlertsResponse {
  alerts: SystemAlert[];
}
