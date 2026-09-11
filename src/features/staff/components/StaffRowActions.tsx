import { useState } from 'react';
import { MoreHorizontal, Pencil, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

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
import { StaffRoleDialog } from '@/features/staff/components/StaffRoleDialog';
import type { StaffListItem } from '@/features/staff/types/staff.types';

interface StaffRowActionsProps {
  readonly staff: StaffListItem;
}

// Two independent items, two independent permissions: "Edit" (profession /
// department / license, `staff:update`) and "Edit role" (`user:assign_role`).
// Each renders only if its own permission is held — the whole menu is hidden
// only when NEITHER is held (mirrors `RoleRowActions`' `return null` for
// `admin`, generalized to "no items to show"). UX gating only; both PATCH
// /staff/:id and PUT /auth/users/:id/role re-check server-side.
export function StaffRowActions({ staff }: StaffRowActionsProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const canUpdateStaff = useCan({ permission: [PERMISSIONS.STAFF.UPDATE] });
  const canAssignRole = useCan({
    permission: [PERMISSIONS.USER.ASSIGN_ROLE],
  });

  // `user: null` means the joined `users` row is soft-deleted — there is no
  // live user to re-scope, and no `roleId` to pre-select, so "Edit role"
  // never applies regardless of permission.
  const canEditRole = canAssignRole && staff.user !== null;

  if (!canUpdateStaff && !canEditRole) {
    return null;
  }

  const label = staff.user?.fullName || staff.staffNumber;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${label}`}
            className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="truncate">{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canUpdateStaff && (
            <DropdownMenuItem asChild>
              <Link to={`/staff/${staff.id}/edit`}>
                <Pencil aria-hidden="true" />
                Edit
              </Link>
            </DropdownMenuItem>
          )}
          {canEditRole && (
            <DropdownMenuItem
              onSelect={() => {
                // Defer so the menu finishes closing (and releases its focus
                // trap) before the dialog opens in the next tick.
                setTimeout(() => setRoleOpen(true), 0);
              }}
            >
              <ShieldCheck aria-hidden="true" />
              Edit role
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mounted only while open, so the dialog's draft role selection is
          re-seeded from the row's current `roleId` on every open without a
          state-sync effect. */}
      {roleOpen && canEditRole && staff.user !== null && (
        <StaffRoleDialog
          staff={{
            // The USER id, never `staff.id` — the endpoint is
            // `PUT /auth/users/:id/role`.
            userId: staff.userId,
            fullName: label,
            roleId: staff.user.roleId,
          }}
          open={roleOpen}
          onOpenChange={setRoleOpen}
        />
      )}
    </>
  );
}
