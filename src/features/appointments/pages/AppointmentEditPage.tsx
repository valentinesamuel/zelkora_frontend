import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { useAppointment } from '@/features/appointments/api/useAppointment';
import { AppointmentForm } from '@/features/appointments/components/AppointmentForm';
import { AppointmentLoadError } from '@/features/appointments/components/AppointmentLoadError';
import { formatAppointmentDateTime } from '@/features/appointments/format';
import { ApiError } from '@/lib/apiClient';

export function AppointmentEditPage() {
  const { appointmentId } = useParams();
  const id = appointmentId ?? '';
  const { data, isPending, isError, error, refetch } = useAppointment(id);

  const notFound = error instanceof ApiError && error.statusCode === 404;

  let body: ReactNode;
  if (isPending) {
    body = (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  } else if (isError) {
    body = (
      <AppointmentLoadError
        notFound={notFound}
        error={error}
        onRetry={() => void refetch()}
      />
    );
  } else {
    // The status select lives inside `AppointmentForm` (edit mode only), and a
    // date/time change here is sent as part of the SAME single PATCH — never
    // as a cancel + recreate pair.
    body = (
      <AppointmentForm mode="edit" appointmentId={id} initialData={data} />
    );
  }

  let subtitle = 'Update an existing appointment.';
  if (data) {
    subtitle = formatAppointmentDateTime(data.startAt);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit appointment
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>

      {body}
    </div>
  );
}
