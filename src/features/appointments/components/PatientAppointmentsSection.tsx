import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { appointmentQuery } from '@/features/appointments/api/appointment.queryMeta';
import { useAppointments } from '@/features/appointments/api/useAppointments';
import { APPOINTMENT_TYPE_OPTIONS } from '@/features/appointments/appointmentOptions';
import { AppointmentDetailSection } from '@/features/appointments/components/AppointmentDetailSection';
import { AppointmentStatusBadge } from '@/features/appointments/components/AppointmentStatusBadge';
import {
  formatAppointmentDateTime,
  formatAppointmentTime,
} from '@/features/appointments/format';
import { PERMISSIONS } from '@/features/auth/permissions';
import { useCan } from '@/features/auth/useCan';

/** How many of the patient's most recent appointments this card shows. */
const RECENT_LIMIT = 10;

interface PatientAppointmentsSectionProps {
  readonly patientId: string;
}

function typeLabel(value: string): string {
  return (
    APPOINTMENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
  );
}

/**
 * The patient-scoped appointments card on the patient detail page: the most
 * recent `RECENT_LIMIT` appointments for one patient, newest first.
 *
 * Read-only and deliberately without a Patient column — the patient is the
 * page you are already on, so repeating it in every row is noise. Row actions
 * and pagination live on the full appointment list, not here.
 */
export function PatientAppointmentsSection({
  patientId,
}: PatientAppointmentsSectionProps) {
  const query = useMemo(
    () =>
      appointmentQuery()
        .where('patientId', 'eq', patientId)
        .sort('startAt', 'desc')
        .limit(RECENT_LIMIT),
    [patientId],
  );
  const { data, isPending, isError, refetch } = useAppointments(query);

  const canCreate = useCan({ permission: [PERMISSIONS.APPOINTMENT.CREATE] });

  let action: ReactNode = null;
  if (canCreate) {
    action = (
      <Button asChild>
        <Link to={`/appointments/new?patientId=${patientId}`}>
          <Plus aria-hidden="true" />
          New appointment
        </Link>
      </Button>
    );
  }

  let body: ReactNode;
  if (isPending) {
    body = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    );
  } else if (isError) {
    body = (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-10 text-center text-destructive-text"
      >
        <AlertTriangle className="size-5" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Couldn't load appointments</p>
          <p className="text-sm">
            Something went wrong while fetching this patient's appointments.
            Please try again.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  } else if (data.data.length === 0) {
    body = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-sm bg-muted text-muted-foreground">
          <CalendarClock className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            No appointments yet
          </p>
          <p className="text-sm text-muted-foreground">
            Upcoming and past visits for this patient will appear here.
          </p>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-36">Type</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-48">Start</TableHead>
              <TableHead className="w-24">End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{typeLabel(appointment.type)}</TableCell>
                <TableCell>
                  <AppointmentStatusBadge status={appointment.status} />
                </TableCell>
                <TableCell>
                  {formatAppointmentDateTime(appointment.startAt)}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatAppointmentTime(appointment.endAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <AppointmentDetailSection title="Appointments" action={action}>
      {body}
    </AppointmentDetailSection>
  );
}
