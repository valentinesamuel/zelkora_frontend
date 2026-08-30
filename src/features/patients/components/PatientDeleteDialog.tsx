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
import { useDeletePatient } from '@/features/patients/api/patientMutations.api';
import { apiErrorMessage } from '@/lib/formErrors';

interface PatientDeleteTarget {
  readonly id: string;
  readonly fullName: string;
  readonly zrn: string;
}

interface PatientDeleteDialogProps {
  patient: PatientDeleteTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}


export function PatientDeleteDialog({
  patient,
  open,
  onOpenChange,
  onDeleted,
}: Readonly<PatientDeleteDialogProps>) {
  const deletePatient = useDeletePatient(patient.id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onConfirm() {
    setErrorMessage(null);
    try {
      await deletePatient.mutateAsync();
      toast.success('Patient deleted.');
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      setErrorMessage(
        apiErrorMessage(
          err,
          'Could not delete this patient. Please try again.',
        ),
      );
    }
  }

  const name = patient.fullName || 'this patient';

  let deleteLabel = 'Delete patient';
  if (deletePatient.isPending) {
    deleteLabel = 'Deleting…';
  }

  let zrnSuffix = '';
  if (patient.zrn) {
    zrnSuffix = ` (${patient.zrn})`;
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (deletePatient.isPending) return;
        if (!next) setErrorMessage(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes{' '}
            <span className="font-medium text-foreground">{name}</span>
            {zrnSuffix} from the active patient register. This can&rsquo;t be
            undone here.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive" role="alert">
            {errorMessage}
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePatient.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={deletePatient.isPending}
          >
            {deleteLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
