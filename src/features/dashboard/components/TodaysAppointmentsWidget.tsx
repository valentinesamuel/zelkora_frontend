import { Link } from 'react-router-dom';

import type { AppointmentStatus } from '@/features/dashboard/types/todaysAppointments.types';
import { useTodaysAppointments } from '@/features/dashboard/api/todaysAppointments.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { WidgetState } from '@/features/dashboard/components/WidgetState';
import { SkeletonList } from '@/features/dashboard/components/SkeletonList';
import { StatusChip } from '@/features/dashboard/components/StatusChip';
import { formatClockTime } from '@/features/dashboard/format';

const CHIP_VARIANT: Record<
  AppointmentStatus,
  'neutral' | 'success' | 'warning' | 'danger'
> = {
  scheduled: 'neutral',
  'checked-in': 'success',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export function TodaysAppointmentsWidget() {
  const { data, isPending, isError, refetch } = useTodaysAppointments();

  return (
    <WidgetCard title="Today's schedule" count={data?.appointments.length}>
      <WidgetState
        data={data}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        skeleton={<SkeletonList rows={4} />}
        errorMessage="Could not load today's appointments."
        isEmpty={(d) => d.appointments.length === 0}
        emptyMessage="No appointments scheduled today."
      >
        {(d) => (
          <ul className="flex min-w-0 flex-col gap-1">
            {d.appointments.map((appointment) => {
              const time = formatClockTime(appointment.scheduledAt);
              return (
                <li key={appointment.id} className="min-w-0">
                  <Link
                    to="/queue"
                    aria-label={`${time}, ${appointment.patientName} with ${appointment.clinician}, ${appointment.statusLabel}. Open queue.`}
                    className="flex h-9 min-w-0 items-center gap-3 rounded-sm px-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {time}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {appointment.patientName}
                    </span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {appointment.clinician}
                    </span>
                    <StatusChip
                      label={appointment.statusLabel}
                      variant={CHIP_VARIANT[appointment.status]}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </WidgetState>
    </WidgetCard>
  );
}
