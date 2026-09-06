import { useAuthStore } from '@/features/auth/authStore';
import { isAdmin } from '@/features/auth/isAdmin';

import { CmoDashboardPage } from './CmoDashboardPage';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (user === null) {
    return null;
  }

  // TODO(FU-1): roleName is now editable DB data, not an enum — move to a
  // capability gate (useCan({ permission: ['dashboard:cmo'] })) once the backend
  // seeds such a permission. Renaming the admin role silently kills this dashboard.
  if (isAdmin(user)) {
    return <CmoDashboardPage />;
  }

  return (
    <div className="p-6 text-muted-foreground">
      No dashboard for your role yet.
    </div>
  );
}
