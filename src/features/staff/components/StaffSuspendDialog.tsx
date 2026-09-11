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
import { useSuspendStaff } from '@/features/staff/api/staffMutations.api';
import { apiErrorMessage } from '@/lib/formErrors';

interface StaffSuspendDialogProps {
  userId: string;
  fullName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffSuspendDialog({
  userId,
  fullName,
  open,
  onOpenChange,
}: Readonly<StaffSuspendDialogProps>) {
  const suspendStaff = useSuspendStaff();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const name = fullName || 'this staff member';

  async function onConfirm() {
    setErrorMessage(null);
    try {
      await suspendStaff.mutateAsync({ userId });
      toast.success('Access suspended.');
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(apiErrorMessage(err, 'Could not suspend this account.'));
    }
  }

  let confirmLabel = 'Suspend access';
  if (suspendStaff.isPending) {
    confirmLabel = 'Suspending…';
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (suspendStaff.isPending) return;
        if (!next) setErrorMessage(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend access for {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will be signed out and their access is cut off on their next
            request. You can restore access later by reactivating this
            account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive" role="alert">
            {errorMessage}
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={suspendStaff.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={suspendStaff.isPending}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
