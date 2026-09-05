import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';

interface BranchListEmptyProps {
  readonly variant: 'no-data' | 'no-results';
  readonly onClearFilters: () => void;
}

export function BranchListEmpty({
  variant,
  onClearFilters,
}: BranchListEmptyProps) {
  const isNoData = variant === 'no-data';

  let Icon = SearchX;
  let heading = 'No branches found';
  let detail = 'Try adjusting your search or filters.';
  let action: ReactNode = (
    <Button variant="outline" onClick={onClearFilters}>
      Clear filters
    </Button>
  );
  if (isNoData) {
    Icon = Building2;
    heading = 'No branches yet';
    detail = 'Create your first branch to see it listed here.';
    action = (
      <Can permission={[PERMISSIONS.BRANCH.CREATE]}>
        <Button asChild>
          <Link to="/branches/new">
            <Plus aria-hidden="true" />
            Create branch
          </Link>
        </Button>
      </Can>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-sm bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{heading}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      {action}
    </div>
  );
}
