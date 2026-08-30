import { useEffect } from 'react';

import { useAuthStore } from './authStore';
import { AuthStatusEnum, RoleEnum, type Role } from './types';

// Runs the silent bootstrap refresh once on app load. Renders nothing. Kept as a
// component (rather than a bare effect in App) so App.tsx stays pure routing.
// The module-level `bootstrapped` guard in authStore covers StrictMode's
// double-invoke.

// Decision D1: dev-only `?devAuth=<role>` stub. DEV-gated so it is
// dead-code-eliminated from the prod bundle. It never touches the token store
// and sets no access token — impossible to mistake for a real session.
const DEV_AUTH_ROLES: readonly Role[] = [
  RoleEnum.ADMIN,
  RoleEnum.DOCTOR,
  RoleEnum.NURSE,
  RoleEnum.RECEPTIONIST,
  RoleEnum.PHARMACIST,
];

function isDevAuthRole(value: string | null): value is Role {
  return (
    value !== null && (DEV_AUTH_ROLES as readonly string[]).includes(value)
  );
}

export function AuthBootstrap() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const requested = new URLSearchParams(window.location.search).get(
        'devAuth',
      );
      if (isDevAuthRole(requested)) {
        useAuthStore.setState({
          user: {
            id: 'dev-cmo',
            email: 'dev.cmo@zelkora.local',
            fullName: 'Adebayo Okonkwo',
            role: requested,
            branchId: 'dev-branch',
          },
          status: AuthStatusEnum.AUTHED,
        });
        return;
      }
    }

    void useAuthStore.getState().bootstrap();
  }, []);

  return null;
}
