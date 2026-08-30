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
import type { Patient } from '@/features/patients/types/patient.types';
import { ApiError } from '@/lib/apiClient';

interface PatientDeleteDialogProps {
  patient: Pick<Patient, 'id' | 'fullName' | 'zrn'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete (e.g. navigate away from a detail page). */
  onDeleted?: () => void;
}

/**
 * Confirmation dialog that owns the delete mutation. On failure it stays open
 * with an inline error — this is where a 403 for non-admin staff surfaces
 * (the action is shown to everyone; the backend is the gate).
 */
export function PatientDeleteDialog({
  patient,
  open,
  onOpenChange,
  onDeleted,
}: PatientDeleteDialogProps) {
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
        err instanceof ApiError
          ? err.apiMessage
          : 'Could not delete this patient. Please try again.',
      );
    }
  }

  const name = patient.fullName || 'this patient';

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Block closing mid-request so the mutation can't be orphaned.
        if (deletePatient.isPending) return;
        // Drop any stale error as the dialog closes, so a later reopen is clean.
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
            {patient.zrn ? ` (${patient.zrn})` : ''} from the active patient
            register. This can&rsquo;t be undone here.
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
            {deletePatient.isPending ? 'Deleting…' : 'Delete patient'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
