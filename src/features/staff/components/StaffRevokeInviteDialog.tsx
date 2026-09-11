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
import { useRevokeInvite } from '@/features/staff/api/staffMutations.api';
import { apiErrorMessage } from '@/lib/formErrors';

interface StaffRevokeInviteDialogProps {
  staffId: string;
  fullName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffRevokeInviteDialog({
  staffId,
  fullName,
  open,
  onOpenChange,
}: Readonly<StaffRevokeInviteDialogProps>) {
  const revokeInvite = useRevokeInvite();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const name = fullName || 'this staff member';

  async function onConfirm() {
    setErrorMessage(null);
    try {
      await revokeInvite.mutateAsync({ staffId });
      toast.success('Invite revoked.');
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(apiErrorMessage(err, 'Could not revoke this invite.'));
    }
  }

  let confirmLabel = 'Revoke invite';
  if (revokeInvite.isPending) {
    confirmLabel = 'Revoking…';
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (revokeInvite.isPending) return;
        if (!next) setErrorMessage(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke invite for {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently cancels the pending invite for{' '}
            <span className="font-medium text-foreground">{name}</span>.
            This can&rsquo;t be undone here.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive" role="alert">
            {errorMessage}
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={revokeInvite.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={revokeInvite.isPending}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
