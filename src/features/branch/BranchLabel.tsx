import { branchNameFor } from '@/features/branch/branches';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

export function BranchLabel() {
  const branchId = useDashboardFiltersStore((s) => s.branchId);
  const name = branchNameFor(branchId);

  if (!name) {
    return null;
  }
  return <>{` · ${name}`}</>;
}
