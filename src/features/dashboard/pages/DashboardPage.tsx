import { useAuthStore } from '@/features/auth/authStore';

import { CmoDashboardPage } from './CmoDashboardPage';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (user === null) {
    throw new Error('DashboardPage rendered without an authenticated user');
  }

  switch (user.role) {
    case 'cmo':
    case 'admin':
      return <CmoDashboardPage />;
    default:
      return (
        <div className="p-6 text-muted-foreground">
          No dashboard for your role yet.
        </div>
      );
  }
}
