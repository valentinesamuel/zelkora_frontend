import { Building2 } from 'lucide-react';

import { queryClient } from '@/app/providers/queryClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PERMISSIONS } from '@/features/auth/permissions';
import { useCan } from '@/features/auth/useCan';
import { useActiveBranches } from '@/features/branch/api/branches.api';
import { selectBranchSwitcherView } from '@/features/branch/branchSwitcherView';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

// Navbar-compact replacement for the former settings-only branch picker
// (`/settings/branch`, since removed). Chooses the branch this device is
// scoped to; the choice is stored locally via `useDashboardFiltersStore` and
// applies to dashboards/lists on this device only.
//
// Unlike the old settings page, this renders nothing for every `hidden`
// reason (no-permission, single-branch, no-data, unreconciled) rather than
// explanatory copy — there's no room for prose in the header, and the
// sidebar's Branches page already surfaces branch creation when needed.
export function BranchSwitcher() {
  const canRead = useCan({ permission: [PERMISSIONS.BRANCH.READ] });
  const { data } = useActiveBranches({ enabled: canRead });
  const branchId = useDashboardFiltersStore((s) => s.branchId);
  const setBranchId = useDashboardFiltersStore((s) => s.setBranchId);
  const view = selectBranchSwitcherView({
    canRead,
    branches: data?.data ?? [],
    branchId,
  });

  if (view.kind !== 'select') return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Active branch: ${view.active.name}`}
          className="flex h-8 max-w-40 shrink-0 items-center gap-1.5 rounded-sm px-2 text-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 data-[state=open]:bg-muted data-[state=open]:text-foreground"
        >
          <Building2 className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{view.active.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>Active branch</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {view.branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onSelect={() => {
              setBranchId(branch.id);
              // Deliberate full clear, not a targeted invalidation: any
              // query added later that turns out to be branch-sensitive is
              // covered by default instead of silently showing stale
              // cross-branch data. A mutation in flight at the moment of
              // switch still settles and its onSuccess invalidation fires
              // against an already-empty cache — a harmless no-op, not
              // guarded against.
              queryClient.clear();
            }}
          >
            {branch.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
