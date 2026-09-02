import { useEffect } from 'react';

import { useAuthStore } from './authStore';

// DEV-ONLY impersonation fixture. `?devAuth=<name>` injects a fake authed user
// with `roleName: <name>` and the mapped permission set below, skipping the real
// bootstrap. NON-AUTHORITATIVE: `000007_seed_patient_permissions` links none of
// these `patient:*` names to a role, so no real non-admin user holds them —
// `nurse`/`receptionist`/`doctor` here reproduce the OLD role-gate visibility for
// dev convenience only. `pharmacist` is deliberately `[]` — the no-permission
// probe for the Phase 5 negative smoke. This whole block is dead-code-eliminated
// in production builds (INV-P6).
const P_READ = 'patient:read';
const P_CREATE = 'patient:create';
const P_DELETE = 'patient:delete';

const DEV_AUTH_PROFILES: Record<string, string[]> = {
  admin: ['*:*'],
  nurse: [P_READ, P_CREATE, P_DELETE],
  receptionist: [P_READ, P_CREATE, P_DELETE],
  doctor: [P_READ],
  pharmacist: [],
};

function isDevAuthProfile(
  value: string | null,
): value is keyof typeof DEV_AUTH_PROFILES {
  return value !== null && Object.hasOwn(DEV_AUTH_PROFILES, value);
}

export function AuthBootstrap() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const requested = new URLSearchParams(window.location.search).get(
        'devAuth',
      );
      if (isDevAuthProfile(requested)) {
        useAuthStore.setState({
          user: {
            id: 'dev-cmo',
            email: 'dev.cmo@zelkora.local',
            fullName: 'Adebayo Okonkwo',
            roleId: `dev-role-${requested}`,
            roleName: requested,
            branchId: 'dev-branch',
            permissions: [...DEV_AUTH_PROFILES[requested]],
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
