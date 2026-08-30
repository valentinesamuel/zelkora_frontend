// System alerts feed payload. Backend: GET /dashboard/system-alerts.

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
