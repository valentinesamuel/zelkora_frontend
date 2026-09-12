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
import { useDeleteAppointment } from '@/features/appointments/api/appointmentMutations.api';
import { apiErrorMessage } from '@/lib/formErrors';

interface AppointmentDeleteTarget {
  readonly id: string;
  readonly label: string;
}

interface AppointmentDeleteDialogProps {
  appointment: AppointmentDeleteTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

// `DELETE /appointments/:id` is a SOFT delete (sets `deletedAt`) — the row
// stops appearing in list queries but is not destroyed.
export function AppointmentDeleteDialog({
  appointment,
  open,
  onOpenChange,
  onDeleted,
}: Readonly<AppointmentDeleteDialogProps>) {
  const deleteAppointment = useDeleteAppointment(appointment.id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onConfirm() {
    setErrorMessage(null);
    try {
      await deleteAppointment.mutateAsync();
      toast.success('Appointment deleted.');
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      setErrorMessage(
        apiErrorMessage(
          err,
          'Could not delete this appointment. Please try again.',
        ),
      );
    }
  }

  let deleteLabel = 'Delete appointment';
  if (deleteAppointment.isPending) {
    deleteLabel = 'Deleting…';
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (deleteAppointment.isPending) return;
        if (!next) setErrorMessage(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this appointment?</AlertDialogTitle>
          <AlertDialogDescription>
            {appointment.label} will no longer appear on the schedule. This
            cannot be undone from the app.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive" role="alert">
            {errorMessage}
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAppointment.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            type="button"
            onClick={() => void onConfirm()}
            disabled={deleteAppointment.isPending}
          >
            {deleteLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
