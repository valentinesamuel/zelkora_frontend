import type { AlertSeverity } from '@/features/dashboard/types/systemAlerts.types';
import { useSystemAlerts } from '@/features/dashboard/api/systemAlerts.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { WidgetState } from '@/features/dashboard/components/WidgetState';
import { SkeletonList } from '@/features/dashboard/components/SkeletonList';
import { LiveIndicator } from '@/features/dashboard/components/LiveIndicator';
import { StatusChip } from '@/features/dashboard/components/StatusChip';
import { countLabel } from '@/features/dashboard/format';

const CHIP_VARIANT: Record<AlertSeverity, 'danger' | 'warning' | 'neutral'> = {
  critical: 'danger',
  warning: 'warning',
  info: 'neutral',
};

export function SystemAlertsWidget() {
  const { data, isPending, isError, refetch } = useSystemAlerts();

  return (
    <WidgetCard
      title="System alerts"
      count={data?.alerts.length}
      headerRight={<LiveIndicator />}
    >
      <p role="status" aria-live="polite" className="sr-only">
        {data && countLabel(data.alerts.length, 'alert')}
      </p>

      <WidgetState
        data={data}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        skeleton={<SkeletonList rows={3} />}
        errorMessage="Could not load system alerts."
        isEmpty={(d) => d.alerts.length === 0}
        emptyMessage="No active alerts."
      >
        {(d) => (
          <div className="min-w-0">
            <ul className="flex min-w-0 flex-col">
              {d.alerts.map((alert) => (
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
                  <p className="text-xs text-muted-foreground">
                    {alert.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </WidgetState>
    </WidgetCard>
  );
}
