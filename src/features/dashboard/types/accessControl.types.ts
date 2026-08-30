// Contract for the access-control toggles panel. Backend swap target:
// GET /dashboard/access-control (see api/accessControl.api.ts).

export interface AccessControlToggle {
  id: string;
  label: string;
  enabled: boolean;
  stateLabel: 'Enabled' | 'Disabled';
}

export interface AccessControlResponse {
  toggles: AccessControlToggle[];
}
