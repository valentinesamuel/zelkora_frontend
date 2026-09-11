import { useState } from 'react';
import {
  MoreHorizontal,
  Pencil,
  PlayCircle,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
import {
  useReactivateStaff,
  useResendInvite,
} from '@/features/staff/api/staffMutations.api';
import { StaffRevokeInviteDialog } from '@/features/staff/components/StaffRevokeInviteDialog';
import { StaffRoleDialog } from '@/features/staff/components/StaffRoleDialog';
import { StaffSuspendDialog } from '@/features/staff/components/StaffSuspendDialog';
import type { StaffListItem } from '@/features/staff/types/staff.types';
import { apiErrorMessage } from '@/lib/formErrors';

interface StaffRowActionsProps {
  readonly staff: StaffListItem;
}

// Six independent items behind six independent permissions: "Edit"
// (profession / department / license, `staff:update`), "Edit role"
// (`user:assign_role`), "Resend invite" / "Revoke invite" (`user:invite`,
// further gated on `status === 'invited'`), "Suspend access" (`user:disable`,
// gated on `status` being `active` or `pending_mfa`), and "Reactivate"
// (`user:enable`, gated on `status === 'disabled'`). Each renders only if its
// own permission (and, for the status-gated four, its status condition) is
// held — the whole menu is hidden only when NONE of the six have anything to
// show (mirrors `RoleRowActions`' `return null` for `admin`, generalized to
// "no items to show"). UX gating only; every underlying endpoint re-checks
// permission and status server-side.
export function StaffRowActions({ staff }: StaffRowActionsProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const canUpdateStaff = useCan({ permission: [PERMISSIONS.STAFF.UPDATE] });
  const canAssignRole = useCan({
    permission: [PERMISSIONS.USER.ASSIGN_ROLE],
  });
  const canInvite = useCan({ permission: [PERMISSIONS.USER.INVITE] });
  const canDisable = useCan({ permission: [PERMISSIONS.USER.DISABLE] });
  const canEnable = useCan({ permission: [PERMISSIONS.USER.ENABLE] });

  const resendInvite = useResendInvite();
  const reactivateStaff = useReactivateStaff();

  // `user: null` means the joined `users` row is soft-deleted — there is no
  // live user to re-scope, no `roleId` to pre-select, and no account status
  // to act on, so none of the five user-scoped items below ever apply
  // regardless of permission.
  const hasUser = staff.user !== null;
  const status = staff.user?.status;

  const canEditRole = canAssignRole && hasUser;
  const canResendInvite = canInvite && hasUser && status === 'invited';
  const canRevokeInvite = canInvite && hasUser && status === 'invited';
  const canSuspend =
    canDisable &&
    hasUser &&
    (status === 'active' || status === 'pending_mfa');
  const canReactivate = canEnable && hasUser && status === 'disabled';

  if (
    !canUpdateStaff &&
    !canEditRole &&
    !canResendInvite &&
    !canRevokeInvite &&
    !canSuspend &&
    !canReactivate
  ) {
    return null;
  }

  const label = staff.user?.fullName || staff.staffNumber;

  function onResendInvite() {
    if (!staff.user) return;
    resendInvite.mutate(
      { staffId: staff.id },
      {
        onSuccess: () => {
          toast.success('Invite resent.');
        },
        onError: (err) => {
          toast.error(apiErrorMessage(err, 'Could not resend invite.'));
        },
      },
    );
  }

  function onReactivate() {
    if (!staff.user) return;
    reactivateStaff.mutate(
      { userId: staff.user.id },
      {
        onSuccess: () => {
          toast.success('Account reactivated.');
        },
        onError: (err) => {
          // The server returns a distinct 409 message
          // (`ErrUserNeverActivated`) when the target's invite was revoked
          // before they ever set a password — surface it verbatim rather
          // than a dead-end generic error.
          toast.error(
            apiErrorMessage(err, 'Could not reactivate this account.'),
          );
        },
      },
    );
  }

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
          {canResendInvite && (
            <DropdownMenuItem onSelect={onResendInvite}>
              <Send aria-hidden="true" />
              Resend invite
            </DropdownMenuItem>
          )}
          {canRevokeInvite && (
            <DropdownMenuItem
              onSelect={() => {
                setTimeout(() => setRevokeOpen(true), 0);
              }}
            >
              <XCircle aria-hidden="true" />
              Revoke invite
            </DropdownMenuItem>
          )}
          {canSuspend && (
            <DropdownMenuItem
              onSelect={() => {
                setTimeout(() => setSuspendOpen(true), 0);
              }}
            >
              <XCircle aria-hidden="true" />
              Suspend access
            </DropdownMenuItem>
          )}
          {canReactivate && (
            <DropdownMenuItem onSelect={onReactivate}>
              <PlayCircle aria-hidden="true" />
              Reactivate
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

      {/* Mounted only while open, so local error state re-seeds per open. */}
      {revokeOpen && canRevokeInvite && (
        <StaffRevokeInviteDialog
          staffId={staff.id}
          fullName={label}
          open={revokeOpen}
          onOpenChange={setRevokeOpen}
        />
      )}

      {suspendOpen && canSuspend && staff.user !== null && (
        <StaffSuspendDialog
          userId={staff.user.id}
          fullName={label}
          open={suspendOpen}
          onOpenChange={setSuspendOpen}
        />
      )}
    </>
  );
}
