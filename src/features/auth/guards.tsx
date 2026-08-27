import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from './authStore';

function AuthSpinner() {
  return (
    <div
      className="auth-spinner"
      role="status"
      aria-live="polite"
      style={{ padding: '2rem', textAlign: 'center' }}
    >
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
