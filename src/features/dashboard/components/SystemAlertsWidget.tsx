import type { AlertSeverity } from '@/features/dashboard/types/systemAlerts.types';
import { useSystemAlerts } from '@/features/dashboard/api/systemAlerts.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { LiveIndicator } from '@/features/dashboard/components/LiveIndicator';
import { StatusChip } from '@/features/dashboard/components/StatusChip';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { SkeletonRow } from '@/features/dashboard/components/SkeletonRow';

const SKELETON_ROWS = ['a', 'b', 'c'] as const;

const CHIP_VARIANT: Record<AlertSeverity, 'danger' | 'warning' | 'neutral'> = {
  critical: 'danger',
  warning: 'warning',
  info: 'neutral',
};

function alertCount(count: number): string {
  return `${count} alert${count === 1 ? '' : 's'}`;
}

/** System alerts feed. The live region announces a count summary only. */
export function SystemAlertsWidget() {
  const { data, isPending, isError, refetch } = useSystemAlerts();

  return (
    <WidgetCard
      title="System alerts"
      count={data?.alerts.length}
      headerRight={<LiveIndicator />}
    >
      <p role="status" aria-live="polite" className="sr-only">
        {data ? alertCount(data.alerts.length) : ''}
      </p>

      {isPending ? (
        <div className="flex flex-col gap-1">
          {SKELETON_ROWS.map((id) => (
            <SkeletonRow key={id} />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          message="Could not load system alerts."
          onRetry={refetch}
        />
      ) : data.alerts.length === 0 ? (
        <EmptyState message="No active alerts." />
      ) : (
        <div className="min-w-0">
          <ul className="flex min-w-0 flex-col">
            {data.alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex min-w-0 flex-col gap-1 border-b py-2 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <StatusChip
                    label={alert.severityLabel}
                    variant={CHIP_VARIANT[alert.severity]}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {alert.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{alert.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </WidgetCard>
  );
}
