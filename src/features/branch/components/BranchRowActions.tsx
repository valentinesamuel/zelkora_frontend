import { MoreHorizontal, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';
import type { BranchListRow } from '@/features/branch/components/branchColumns';

interface BranchRowActionsProps {
  readonly branch: BranchListRow;
}

// Edit is the ONLY row action. There is no branch DELETE route or UI anywhere
// in this feature (INV-B2) — deactivation via the edit form is the only
// retirement path. The whole control is gated: a user without `branch:update`
// gets no menu rather than a dead one.
export function BranchRowActions({ branch }: BranchRowActionsProps) {
  return (
    <Can permission={[PERMISSIONS.BRANCH.UPDATE]}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${branch.name || branch.code}`}
            className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="truncate">
            {branch.name || branch.code}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={`/branches/${branch.id}/edit`}>
              <Pencil aria-hidden="true" />
              Edit branch
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Can>
  );
}
