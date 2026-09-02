import type { ReactNode } from 'react';

import type { RequiredPermission } from './authorize';
import { useCan } from './useCan';

interface CanProps {
  readonly permission?: RequiredPermission[];
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

/**
 * Declarative authorization gate. UX gating only — the server re-checks every
 * request from the DB. (Today that re-check on patient mutations is role-name
 * based, `RequireRole(...)`, not permission based — see INV-P9's footnote /
 * plan D5. `<Can>` and the server therefore align only for `admin` this cycle.)
 *
 *   <Can permission={['patient:delete']}>
 *     <DeletePatientButton />
 *   </Can>
 *
 * Renders `children` when the user holds EVERY listed permission (ALL
 * semantics), otherwise `fallback` (nothing by default). A required `X:Y` is
 * satisfied by a held `X:Y`, `*:*`, or `X:*` — and nothing else (no `*:Y`, no
 * prefix/glob/regex). An empty or omitted `permission` means "authenticated
 * only". See `authorize` for the full rules — because the server does no
 * wildcard expansion, that function is authoritative.
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const allowed = useCan({ permission });
  if (allowed) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
