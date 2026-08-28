import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';

import { useAuthStore } from './authStore';

function AuthSpinner() {
  return (
    <div
      className="flex items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {/* The wrapper owns the live region; the icon is decorative so the
          "Loading…" text is announced exactly once (as before). */}
      <Spinner role={undefined} aria-label={undefined} aria-hidden="true" />
      Loading…
    </div>
  );
}


export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  if (status === 'loading') {
    return <AuthSpinner />;
  }
  if (status === 'anon') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}


export function PublicOnly({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  if (status === 'loading') {
    return <AuthSpinner />;
  }
  if (status === 'authed') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
