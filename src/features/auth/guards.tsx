import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';

import { useAuthStore } from './authStore';
import { AuthStatusEnum } from './types';

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
  if (status === AuthStatusEnum.LOADING) {
    return <AuthSpinner />;
  }
  if (status === AuthStatusEnum.ANON) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function PublicOnly({ children }: Readonly<{ children: ReactNode }>) {
  const status = useAuthStore((s) => s.status);
  if (status === AuthStatusEnum.LOADING) {
    return <AuthSpinner />;
  }
  if (status === AuthStatusEnum.AUTHED) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
