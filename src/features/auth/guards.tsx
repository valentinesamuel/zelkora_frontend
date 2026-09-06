import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';

import type { RequiredPermission } from './authorize';
import { useAuthStore } from './authStore';
import { isAdmin } from './isAdmin';
import { useCan } from './useCan';

function AuthSpinner() {
  return (
    <div
      className="flex items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Spinner role={undefined} aria-label={undefined} aria-hidden="true" />
      Loading…
    </div>
  );
}

export function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const status = useAuthStore((s) => s.status);
  if (status === 'loading') {
    return <AuthSpinner />;
  }
  if (status === 'anon') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/**
 * Route-level permission gate. Convenience only — NOT security (INV-P9): the
 * server re-checks every request, and client-side `authorize()` can disagree
 * with it. Renders `children` when the user holds every listed permission,
 * otherwise redirects to `redirectTo` (default `/dashboard`). Always sits
 * inside `RequireAuth`, so `status` is already `authed` by the time it runs;
 * the `loading` branch is defensive only.
 */
export function RequirePermission({
  permission,
  redirectTo = '/dashboard',
  children,
}: Readonly<{
  permission: RequiredPermission[];
  redirectTo?: string;
  children: ReactNode;
}>) {
  const status = useAuthStore((s) => s.status);
  const allowed = useCan({ permission });
  if (status === 'loading') {
    return <AuthSpinner />;
  }
  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

/**
 * Route-level admin gate. Convenience/UX only — NOT security (INV-P9): the
 * server re-checks every request, and this client-side role check can disagree
 * with it. Renders `children` when the user's role is `admin`, otherwise
 * redirects to `redirectTo` (default `/dashboard`). Always sits inside
 * `RequireAuth`, so `status` is already `authed` by the time it runs; the
 * `loading` branch is defensive only.
 */
export function RequireAdmin({
  redirectTo = '/dashboard',
  children,
}: Readonly<{ redirectTo?: string; children: ReactNode }>) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  if (status === 'loading') {
    return <AuthSpinner />;
  }
  if (!isAdmin(user)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

export function PublicOnly({ children }: Readonly<{ children: ReactNode }>) {
  const status = useAuthStore((s) => s.status);
  if (status === 'loading') {
    return <AuthSpinner />;
  }
  if (status === 'authed') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
