import { useAuthStore } from '@/features/auth/authStore';

import { dashboardRegistry, DefaultDashboard } from '../dashboardRegistry';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (user === null) {
    return null;
  }

  const Dashboard = dashboardRegistry[user.roleName] ?? DefaultDashboard;
  return <Dashboard />;
}
