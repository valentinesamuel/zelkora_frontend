import { Link } from 'react-router-dom';

import type { AppointmentStatus } from '@/features/dashboard/types/todaysAppointments.types';
import { useTodaysAppointments } from '@/features/dashboard/api/todaysAppointments.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { StatusChip } from '@/features/dashboard/components/StatusChip';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { SkeletonRow } from '@/features/dashboard/components/SkeletonRow';

const SKELETON_ROWS = ['a', 'b', 'c', 'd'] as const;

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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Today's schedule. Each row links to the queue. */
export function TodaysAppointmentsWidget() {
  const { data, isPending, isError, refetch } = useTodaysAppointments();

  return (
    <WidgetCard title="Today's schedule" count={data?.appointments.length}>
      {isPending ? (
        <div className="flex flex-col gap-1">
          {SKELETON_ROWS.map((id) => (
            <SkeletonRow key={id} />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          message="Could not load today's appointments."
          onRetry={refetch}
        />
      ) : data.appointments.length === 0 ? (
        <EmptyState message="No appointments scheduled today." />
      ) : (
        <ul className="flex min-w-0 flex-col gap-1">
          {data.appointments.map((appointment) => {
            const time = formatTime(appointment.scheduledAt);
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
    </WidgetCard>
  );
}
