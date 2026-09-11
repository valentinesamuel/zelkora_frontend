import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignStaffRole } from '@/features/staff/api/staffMutations.api';
import { assignErrorMessage } from '@/features/staff/assignRoleError';
import { assignRoleSchema } from '@/features/staff/assignRole.schema';
import { useRoles } from '@/features/staff/hooks/useRoles';

// Everything this dialog needs from a staff row. `userId` is the USER id —
// `PUT /auth/users/:id/role` takes the user id, never the staff id.
export interface StaffRoleTarget {
  readonly userId: string;
  readonly fullName: string;
  readonly roleId: string;
}

interface StaffRoleDialogProps {
  readonly staff: StaffRoleTarget;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

const SELECT_ID = 'staff-role-dialog-role';

function submitLabel(isPending: boolean): string {
  if (isPending) return 'Saving…';
  return 'Save role';
}

export function StaffRoleDialog({
  staff,
  open,
  onOpenChange,
}: StaffRoleDialogProps) {
  const roles = useRoles();
  const assignRole = useAssignStaffRole();
  // The draft selection is seeded from the member's CURRENT role and needs no
  // reset effect: `StaffRowActions` mounts this component only while the
  // dialog is open, so every open starts from a fresh `useState` seed.
  const [selectedRoleId, setSelectedRoleId] = useState(staff.roleId);

  const roleOptions = roles.data ?? [];
  // `useRoles()` returns `{id, name}` only, so the CURRENT role's display name
  // is resolved by matching the row's `roleId` against that list.
  const currentRoleName = roleOptions.find(
    (role) => role.id === staff.roleId,
  )?.name;

  async function onSubmit() {
    const parsed = assignRoleSchema.safeParse({ roleId: selectedRoleId });
    if (!parsed.success) {
      toast.error('Select a role.');
      return;
    }
    try {
      await assignRole.mutateAsync({
        // INV: the user id, never `staff.id`.
        userId: staff.userId,
        roleId: parsed.data.roleId,
      });
      toast.success(
        "Role updated — the user's next request will use the new permissions.",
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(assignErrorMessage(err));
    }
  }

  const unchanged = selectedRoleId === staff.roleId;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (assignRole.isPending) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit role</AlertDialogTitle>
          <AlertDialogDescription>
            Change the role for{' '}
            <span className="font-medium text-foreground">
              {staff.fullName}
            </span>
            . Current role:{' '}
            <span className="font-medium text-foreground">
              {currentRoleName || 'unknown'}
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor={SELECT_ID}>Role</Label>
          <Select
            value={selectedRoleId || undefined}
            onValueChange={setSelectedRoleId}
            disabled={roles.isPending || assignRole.isPending}
          >
            <SelectTrigger id={SELECT_ID} className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {roles.isError && (
            <p className="text-sm text-destructive" role="alert">
              Could not load roles.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={assignRole.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={unchanged || assignRole.isPending}
          >
            {submitLabel(assignRole.isPending)}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
