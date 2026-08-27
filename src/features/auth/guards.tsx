import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from './useAuth';

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

// 'loading' -> spinner (this is what prevents a flash of /login on reload);
// 'anon' -> redirect to /login; 'authed' -> render children.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading') {
    return <AuthSpinner />;
  }
  if (status === 'anon') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// 'loading' -> spinner; 'authed' -> redirect to /; 'anon' -> render children.
// `replace` on both so Back does not bounce through a redirect loop.
export function PublicOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading') {
    return <AuthSpinner />;
  }
  if (status === 'authed') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
