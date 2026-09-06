import type { ComponentType } from 'react';

import { CmoDashboardPage } from './pages/CmoDashboardPage';
import { WelcomeDashboard } from './pages/WelcomeDashboard';

/** roleName → dashboard component. Roles absent here fall back to WelcomeDashboard.
 *  Keyed by the DB `roles.name` value carried in the `/auth/me` `roleName` field. */
export const dashboardRegistry: Record<string, ComponentType> = {
  admin: CmoDashboardPage,
};

export const DefaultDashboard = WelcomeDashboard;
