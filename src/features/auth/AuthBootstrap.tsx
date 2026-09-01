import { useEffect } from 'react';

import { useAuthStore } from './authStore';
import type { Role } from './types';

const DEV_AUTH_ROLES: readonly Role[] = [
  'admin',
  'doctor',
  'nurse',
  'receptionist',
  'pharmacist',
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
          status: 'authed',
        });
        return;
      }
    }

    void useAuthStore.getState().bootstrap();
  }, []);

  return null;
}
