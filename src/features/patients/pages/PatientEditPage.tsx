import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { usePatient } from '@/features/patients/api/patients.api';
import { PatientForm } from '@/features/patients/components/PatientForm';
import { PatientFormSkeleton } from '@/features/patients/components/PatientFormSkeleton';
import { PatientLoadError } from '@/features/patients/components/PatientLoadError';
import { fullNameOf } from '@/features/patients/types/patient.types';
import { ApiError } from '@/lib/apiClient';

export function PatientEditPage() {
  const { patientId } = useParams();
  const id = patientId ?? '';
  const { data, isPending, isError, error, refetch } = usePatient(id);

  const notFound = error instanceof ApiError && error.statusCode === 404;

  let body: ReactNode;
  if (isPending) {
    body = <PatientFormSkeleton />;
  } else if (isError) {
    body = (
      <PatientLoadError
        notFound={notFound}
        error={error}
        onRetry={() => void refetch()}
      />
    );
  } else {
    body = <PatientForm mode="edit" patientId={id} initialData={data} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit patient
        </h1>
        <p className="text-sm text-muted-foreground">
          {data ? fullNameOf(data) : 'Update an existing patient record.'}
        </p>
      </header>

      {body}
    </div>
  );
}
