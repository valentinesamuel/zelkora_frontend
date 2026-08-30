// Contract for the recent-activity audit feed. Backend swap target:
// GET /dashboard/recent-activity (see api/recentActivity.api.ts).

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
