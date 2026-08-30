// A subscription-free element for `AppSidebar`'s footer, so the chrome gains a
// feature component rather than a store hook (I-39). Renders ` · <name>` from
// `branchNameFor`, or `null` when the id is unknown — never a raw id (I-38 /
// F3-h: this is the exact wart being removed).

import { branchNameFor } from '@/features/branch/branches';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

export function BranchLabel() {
  const branchId = useDashboardFiltersStore((s) => s.branchId);
  const name = branchNameFor(branchId);

  return name ? <>{` · ${name}`}</> : null;
}
