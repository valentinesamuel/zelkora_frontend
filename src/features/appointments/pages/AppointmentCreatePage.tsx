import { useSearchParams } from 'react-router-dom';

import { AppointmentForm } from '@/features/appointments/components/AppointmentForm';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function AppointmentCreatePage() {
  const [searchParams] = useSearchParams();

  // Optional prefill: a later phase links here from a patient record as
  // `/appointments/new?patientId=…`. A malformed value is ignored rather than
  // seeded into the form, where it would fail the schema's uuid check with no
  // way for the user to see why.
  const rawPatientId = searchParams.get('patientId');
  let initialPatientId: string | undefined;
  if (rawPatientId !== null && UUID.test(rawPatientId)) {
    initialPatientId = rawPatientId;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Schedule appointment
        </h1>
        <p className="text-sm text-muted-foreground">
          Book a slot for a patient with a member of staff.
        </p>
      </header>
      <AppointmentForm mode="create" initialPatientId={initialPatientId} />
    </div>
  );
}
