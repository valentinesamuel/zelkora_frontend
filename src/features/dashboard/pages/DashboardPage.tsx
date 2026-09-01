import { useAuthStore } from '@/features/auth/authStore';

import { CmoDashboardPage } from './CmoDashboardPage';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (user === null) {
    return null;
  }

  if (user.role === 'admin') {
    return <CmoDashboardPage />;
  }

  return (
    <div className="p-6 text-muted-foreground">
      No dashboard for your role yet.
    </div>
  );
}
