import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { usePatient } from '@/features/patients/api/patients.api';
import { PatientForm } from '@/features/patients/components/PatientForm';
import { PatientFormSkeleton } from '@/features/patients/components/PatientFormSkeleton';
import { fullNameOf } from '@/features/patients/types/patient.types';
import { ApiError } from '@/lib/apiClient';

export function PatientEditPage() {
  const { patientId } = useParams();
  const id = patientId ?? '';
  const { data, isPending, isError, error, refetch } = usePatient(id);

  const notFound = error instanceof ApiError && error.statusCode === 404;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit patient
        </h1>
        <p className="text-sm text-muted-foreground">
          {data ? fullNameOf(data) : 'Update an existing patient record.'}
        </p>
      </header>

      {isPending ? (
        <PatientFormSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">
            {notFound ? 'Patient not found.' : 'Could not load this patient.'}
          </p>
          <p className="text-muted-foreground">
            {notFound
              ? 'It may have been removed, or the link is incorrect.'
              : error instanceof ApiError
                ? error.apiMessage
                : 'Please try again.'}
          </p>
          <div className="flex gap-3">
            {!notFound && (
              <Button type="button" onClick={() => void refetch()}>
                Retry
              </Button>
            )}
            <Button type="button" variant="outline" asChild>
              <Link to="/patients">Back to patients</Link>
            </Button>
          </div>
        </div>
      ) : (
        <PatientForm mode="edit" patientId={id} initialData={data} />
      )}
    </div>
  );
}
