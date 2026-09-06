import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { PERMISSIONS } from '@/features/auth/permissions';
import { useCan } from '@/features/auth/useCan';
import { useActiveBranches } from '@/features/branch/api/branches.api';
import {
  selectBranchSwitcherView,
  type BranchSwitcherView,
} from '@/features/branch/branchSwitcherView';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

const MUTED_TEXT = 'text-sm text-muted-foreground';

interface RenderBranchControlOptions {
  readonly setBranchId: (id: string) => void;
  readonly canCreate: boolean;
}

function renderBranchControl(
  view: BranchSwitcherView,
  opts: RenderBranchControlOptions,
): ReactNode {
  if (view.kind === 'select') {
    return (
      <Select value={view.active.id} onValueChange={opts.setBranchId}>
        <SelectTrigger aria-label="Active branch"
          className="w-full min-w-0 truncate">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {view.branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

    );
  }

  if (view.reason === 'no-permission') {
    return (
      <p className={MUTED_TEXT}>You do not have permission to view branches.</p>
    );
  }

  if (view.reason === 'single-branch') {
    return <p className={MUTED_TEXT}>This deployment has a single branch.</p>;
  }

  if (view.reason === 'no-data') {
    return (
      <div className="flex flex-col gap-2">
        <p className={MUTED_TEXT}>No branches found.</p>
        {opts.canCreate && (
          <Link
            to="/branches/new"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Create a branch
          </Link>
        )}
      </div>
    );
  }

  if (view.reason === 'unreconciled') {
    return (
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Resolving active branch…
      </span>
    );
  }

  return <p className={MUTED_TEXT}>Branch control unavailable.</p>;
}

export function BranchSettingsPage() {
  const canRead = useCan({ permission: [PERMISSIONS.BRANCH.READ] });
  const canCreate = useCan({ permission: [PERMISSIONS.BRANCH.CREATE] });
  const { data } = useActiveBranches({ enabled: canRead });
  const branchId = useDashboardFiltersStore((s) => s.branchId);
  const setBranchId = useDashboardFiltersStore((s) => s.setBranchId);
  const view = selectBranchSwitcherView({
    canRead,
    branches: data?.data ?? [],
    branchId,
  });

  return (
    <section>
      <h2 className="text-base font-semibold">Branch</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This chooses the branch this device is scoped to, and it applies to
        dashboards and lists on this device only. The choice is stored locally in
        this browser.
      </p>
      <div className="mt-4">
        {renderBranchControl(view, { setBranchId, canCreate })}
      </div>
    </section>
  );
}
