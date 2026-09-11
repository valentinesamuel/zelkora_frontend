import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { RoleDeleteDialog } from '@/features/roles/components/RoleDeleteDialog';
import type { RoleListRow } from '@/features/roles/components/roleColumns';

interface RoleRowActionsProps {
  readonly role: RoleListRow;
}

// The `admin` role renders NO menu at all — not a disabled one, not one with
// a subset of items. The server independently enforces this (403 on update
// or delete of `admin`), but the row action here must not even offer the
// affordance.
export function RoleRowActions({ role }: RoleRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (role.name === 'admin') {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${role.name}`}
            className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="truncate">
            {role.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Can permission={[PERMISSIONS.ROLE.UPDATE]}>
            <DropdownMenuItem asChild>
              <Link to={`/settings/roles/${role.id}/edit`}>
                <Pencil aria-hidden="true" />
                Edit role
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={[PERMISSIONS.ROLE.DELETE]}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                // Defer so the menu finishes closing (and releases its focus
                // trap) before the dialog opens in the next tick.
                setTimeout(() => setDeleteOpen(true), 0);
              }}
            >
              <Trash2 aria-hidden="true" />
              Delete role
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleDeleteDialog
        role={{ id: role.id, name: role.name, userCount: role.userCount }}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
