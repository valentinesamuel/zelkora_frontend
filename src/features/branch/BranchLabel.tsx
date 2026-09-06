// Sidebar footer branch name. Resolves the name from the `useActiveBranches()`
// cache (D9) — no detail request, shared constant key with `BranchSwitcher` and
// `useBranchHydration`. Renders nothing rather than a raw id when the name
// cannot be resolved (I-38): unknown/inactive/unresolved id, 403, or no
// `branch:read`.

import { PERMISSIONS } from '@/features/auth/permissions';
import { useCan } from '@/features/auth/useCan';
import { useActiveBranches } from '@/features/branch/api/branches.api';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

export function BranchLabel() {
  const branchId = useDashboardFiltersStore((s) => s.branchId);

  const canRead = useCan({ permission: [PERMISSIONS.BRANCH.READ] });
  const { data } = useActiveBranches({ enabled: canRead });

  const branches = data?.data ?? [];
  const name = branches.find((b) => b.id === branchId)?.name ?? null;
  if (!name) {
    return null;
  }
  return <>{` · ${name}`}</>;
}
