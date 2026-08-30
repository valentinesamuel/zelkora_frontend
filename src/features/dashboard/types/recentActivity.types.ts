// Recent-activity audit feed payload. Backend: GET /dashboard/recent-activity.

export interface ActivityEntry {
  id: string;
  actorName: string;
  action: string;
  targetLabel: string;
  occurredAt: string;
}

export interface RecentActivityResponse {
  entries: ActivityEntry[];
}
