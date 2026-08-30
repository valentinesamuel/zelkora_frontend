import type { SystemHealthStatus } from '@/features/dashboard/types/systemHealth.types';
import { useSystemHealth } from '@/features/dashboard/api/systemHealth.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { WidgetState } from '@/features/dashboard/components/WidgetState';
import { SkeletonList } from '@/features/dashboard/components/SkeletonList';
import { StatusChip } from '@/features/dashboard/components/StatusChip';

const CHIP_VARIANT: Record<
  SystemHealthStatus,
  'success' | 'warning' | 'danger'
> = {
  ok: 'success',
  degraded: 'warning',
  down: 'danger',
};

export function SystemHealthWidget() {
  const { data, isPending, isError, refetch } = useSystemHealth();

  return (
    <WidgetCard title="System health" count={data?.tiles.length}>
      <WidgetState
        data={data}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        skeleton={<SkeletonList rows={3} />}
        errorMessage="Could not load system health."
        isEmpty={(d) => d.tiles.length === 0}
        emptyMessage="No health checks reported."
      >
        {(d) => (
          <ul className="flex min-w-0 flex-col">
            {d.tiles.map((tile) => (
              <li
                key={tile.id}
                className="flex min-w-0 flex-col gap-1 border-b py-2 last:border-b-0"
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {tile.label}
                  </span>
                  <StatusChip
                    label={tile.statusLabel}
                    variant={CHIP_VARIANT[tile.status]}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{tile.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </WidgetState>
    </WidgetCard>
  );
}
