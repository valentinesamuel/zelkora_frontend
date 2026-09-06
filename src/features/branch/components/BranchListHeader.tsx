import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';

export function BranchListHeader() {
  return (
    <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Branches
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage your organisation&rsquo;s branches.
        </p>
      </div>
      <Can permission={[PERMISSIONS.BRANCH.CREATE]}>
        <Button asChild>
          <Link to="/branches/new">
            <Plus aria-hidden="true" />
            Create branch
          </Link>
        </Button>
      </Can>
    </header>
  );
}
