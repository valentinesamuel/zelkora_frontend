import type { ReactNode } from 'react';

import type { Permission } from './authorize';
import type { Role } from './types';
import { useCan } from './useCan';

interface CanProps {
  readonly role?: Role[];
  readonly permission?: Permission[];
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

/**
 * Declarative authorization gate. UX gating only — the server re-checks every
 * request from the DB.
 *
 *   <Can role={['admin', 'doctor']} permission={['patients.update']}>
 *     <UpdatePatientButton />
 *   </Can>
 *
 * Renders `children` when the user's role is in `role` OR they hold any listed
 * `permission`; otherwise renders `fallback` (nothing by default). Role matching
 * is exact. See `authorize` for the full rules.
 */
export function Can({ role, permission, children, fallback = null }: CanProps) {
  const allowed = useCan({ role, permission });
  if (allowed) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
