// Contract for the system-health tiles. Backend swap target:
// GET /dashboard/system-health (see api/systemHealth.api.ts).

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
