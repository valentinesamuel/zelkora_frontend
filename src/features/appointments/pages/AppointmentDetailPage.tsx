import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileText, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointment } from '@/features/appointments/api/useAppointment';
import {
  usePatientOptionLabel,
  useStaffOptionLabel,
} from '@/features/appointments/api/appointmentPickers';
import { AppointmentDeleteDialog } from '@/features/appointments/components/AppointmentDeleteDialog';
import { AppointmentDetailField } from '@/features/appointments/components/AppointmentDetailField';
import { AppointmentDetailSection } from '@/features/appointments/components/AppointmentDetailSection';
import { AppointmentLoadError } from '@/features/appointments/components/AppointmentLoadError';
import { AppointmentStatusBadge } from '@/features/appointments/components/AppointmentStatusBadge';
import { APPOINTMENT_TYPE_OPTIONS } from '@/features/appointments/appointmentOptions';
import {
  formatAppointmentDateTime,
  formatAppointmentTime,
  formatOptionalText,
} from '@/features/appointments/format';
import type { Appointment } from '@/features/appointments/types/appointment.types';
import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';
import { ApiError } from '@/lib/apiClient';

function typeLabel(value: string): string {
  return (
    APPOINTMENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
  );
}

export function AppointmentDetailPage() {
  const { appointmentId } = useParams();
  const id = appointmentId ?? '';
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useAppointment(id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const notFound = error instanceof ApiError && error.statusCode === 404;

  let body: ReactNode;
  if (isPending) {
    body = (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
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
    body = (
      <AppointmentDetailContent
        appointment={data}
        onEditPath={`/appointments/${id}/edit`}
        onDelete={() => setDeleteOpen(true)}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      {body}

      {data && (
        <AppointmentDeleteDialog
          appointment={{
            id: data.id,
            label: `This appointment on ${formatAppointmentDateTime(data.startAt)}`,
          }}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={() => navigate('/appointments')}
        />
      )}
    </div>
  );
}

interface AppointmentDetailContentProps {
  appointment: Appointment;
  onEditPath: string;
  onDelete: () => void;
}

// `GET /appointments/:id` returns the root row only — no joins — so the
// patient and staff names are resolved through the same option lookups the
// form's comboboxes use, and fall back to the raw id while they load.
function AppointmentDetailContent({
  appointment,
  onEditPath,
  onDelete,
}: Readonly<AppointmentDetailContentProps>) {
  const patientLabel = usePatientOptionLabel(appointment.patientId);
  const staffLabel = useStaffOptionLabel(appointment.staffId);

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {patientLabel ?? 'Appointment'}
            </h1>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatAppointmentDateTime(appointment.startAt)} &ndash;{' '}
            {formatAppointmentTime(appointment.endAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Can permission={[PERMISSIONS.APPOINTMENT.UPDATE]}>
            <Button variant="outline" asChild>
              <Link to={onEditPath}>
                <Pencil aria-hidden="true" />
                Edit
              </Link>
            </Button>
          </Can>
          <Can permission={[PERMISSIONS.APPOINTMENT.DELETE]}>
            <Button variant="destructive" type="button" onClick={onDelete}>
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
          </Can>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AppointmentDetailSection title="Participants">
            <dl className="grid gap-4 sm:grid-cols-2">
              <AppointmentDetailField
                label="Patient"
                value={patientLabel ?? appointment.patientId}
              />
              <AppointmentDetailField
                label="Staff member"
                value={staffLabel ?? appointment.staffId}
              />
            </dl>
          </AppointmentDetailSection>

          <AppointmentDetailSection title="Schedule">
            <dl className="grid gap-4 sm:grid-cols-2">
              <AppointmentDetailField
                label="Starts"
                value={formatAppointmentDateTime(appointment.startAt)}
              />
              <AppointmentDetailField
                label="Ends"
                value={formatAppointmentDateTime(appointment.endAt)}
              />
              <AppointmentDetailField
                label="Type"
                value={typeLabel(appointment.type)}
              />
            </dl>
          </AppointmentDetailSection>

          <AppointmentDetailSection title="Clinical context">
            <dl className="grid gap-4">
              <AppointmentDetailField
                label="Reason"
                value={formatOptionalText(appointment.reason)}
              />
              <AppointmentDetailField
                label="Notes"
                value={formatOptionalText(appointment.notes)}
              />
            </dl>
          </AppointmentDetailSection>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="[--card-spacing:--spacing(5)] h-fit lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Quick facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-4">
                <AppointmentDetailField
                  label="Status"
                  value={<AppointmentStatusBadge status={appointment.status} />}
                />
                <AppointmentDetailField
                  label="Type"
                  value={typeLabel(appointment.type)}
                />
                <AppointmentDetailField
                  label="Created"
                  value={formatAppointmentDateTime(appointment.createdAt)}
                />
                <AppointmentDetailField
                  label="Last updated"
                  value={formatAppointmentDateTime(appointment.updatedAt)}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
