// The visible branch control, mounted in `AppHeader`'s right cell. A feature
// component — the chrome stays dumb (I-39), so this file owns the store
// subscription and calls `useBranchHydration()` itself.

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { BRANCHES } from '@/features/branch/branches';
import { useBranchHydration } from '@/features/branch/useBranchHydration';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

export function BranchSwitcher() {
  useBranchHydration();

  const branchId = useDashboardFiltersStore((s) => s.branchId);
  const setBranchId = useDashboardFiltersStore((s) => s.setBranchId);

  // A one-branch deployment should not show a dead control. BRANCHES has ~4, so
  // this is defensive only.
  if (BRANCHES.length < 2) {
    return null;
  }

  const active = BRANCHES.find((b) => b.id === branchId) ?? BRANCHES[0]!;

  return (
    <Select value={branchId} onValueChange={setBranchId}>
      <SelectTrigger
        aria-label="Switch branch"
        className="h-8 min-w-0 truncate rounded-sm border text-sm focus-visible:border-input focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        {/* Two spans, not a JS breakpoint read — no matchMedia, no resize
            listener, no hydration mismatch. shortName below sm, full name at
            sm and up. */}
        <span className="truncate sm:hidden">{active.shortName}</span>
        <span className="hidden truncate sm:inline">{active.name}</span>
      </SelectTrigger>
      <SelectContent>
        {BRANCHES.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
