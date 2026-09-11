import { useState } from 'react';
import { toast } from 'sonner';

import { Alert } from '@/components/ui/alert';
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
import { useDeleteRole } from '@/features/roles/roleMutations.api';
import { ApiError } from '@/lib/apiClient';
import { apiErrorMessage } from '@/lib/formErrors';

interface RoleDeleteTarget {
  readonly id: string;
  readonly name: string;
  readonly userCount: number;
}

interface RoleDeleteDialogProps {
  role: RoleDeleteTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

// The server's copy for the two sentinel statuses this dialog can hit:
//   - 409 (still in use): "This role is still assigned to N user(s)" — the
//     server already renders N, so `apiErrorMessage` surfaces it verbatim.
//   - 403 (admin-immutable): should never actually fire here, because
//     `RoleRowActions` renders no delete item at all for `admin` — but the
//     fallback below still gives a sane message if it somehow does.
function deleteFallbackMessage(err: unknown, role: RoleDeleteTarget): string {
  if (err instanceof ApiError && err.statusCode === 409) {
    return `This role is still assigned to ${role.userCount} user(s).`;
  }
  if (err instanceof ApiError && err.statusCode === 403) {
    return 'The admin role cannot be modified.';
  }
  return 'Could not delete this role. Please try again.';
}

export function RoleDeleteDialog({
  role,
  open,
  onOpenChange,
  onDeleted,
}: Readonly<RoleDeleteDialogProps>) {
  const deleteRole = useDeleteRole(role.id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onConfirm() {
    setErrorMessage(null);
    try {
      await deleteRole.mutateAsync();
      toast.success('Role deleted.');
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      setErrorMessage(apiErrorMessage(err, deleteFallbackMessage(err, role)));
    }
  }

  const name = role.name || 'this role';

  let deleteLabel = 'Delete role';
  if (deleteRole.isPending) {
    deleteLabel = 'Deleting…';
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (deleteRole.isPending) return;
        if (!next) setErrorMessage(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the{' '}
            <span className="font-medium text-foreground">{name}</span> role.
            This can&rsquo;t be undone here.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive" role="alert">
            {errorMessage}
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteRole.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={deleteRole.isPending}
          >
            {deleteLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
