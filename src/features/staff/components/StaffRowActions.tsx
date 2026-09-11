import { useState } from 'react';
import { MoreHorizontal, ShieldCheck } from 'lucide-react';

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

// "Edit role" is the only item, so the gate is the whole menu: without
// `user:assign_role` there is NO menu at all — not a disabled one, not an
// empty one (mirrors `RoleRowActions`' `return null` for `admin`). UX gating
// only; `PUT /auth/users/:id/role` re-checks the permission server-side.
export function StaffRowActions({ staff }: StaffRowActionsProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const canAssignRole = useCan({
    permission: [PERMISSIONS.USER.ASSIGN_ROLE],
  });

  // `user: null` means the joined `users` row is soft-deleted — there is no
  // live user to re-scope, and no `roleId` to pre-select.
  if (!canAssignRole || staff.user === null) {
    return null;
  }

  const label = staff.user.fullName || staff.staffNumber;

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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mounted only while open, so the dialog's draft role selection is
          re-seeded from the row's current `roleId` on every open without a
          state-sync effect. */}
      {roleOpen && (
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
