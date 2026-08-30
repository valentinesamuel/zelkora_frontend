// System-health tiles payload. Backend: GET /dashboard/system-health.

export type SystemHealthStatus = 'ok' | 'degraded' | 'down';

export interface SystemHealthTile {
  id: string;
  label: string;
  status: SystemHealthStatus;
  statusLabel: string;
  detail: string;
}

export interface SystemHealthResponse {
  tiles: SystemHealthTile[];
}
