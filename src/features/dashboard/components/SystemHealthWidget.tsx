import type { SystemHealthStatus } from '@/features/dashboard/types/systemHealth.types';
import { useSystemHealth } from '@/features/dashboard/api/systemHealth.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { StatusChip } from '@/features/dashboard/components/StatusChip';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { SkeletonRow } from '@/features/dashboard/components/SkeletonRow';

const SKELETON_ROWS = ['a', 'b', 'c'] as const;

const CHIP_VARIANT: Record<SystemHealthStatus, 'success' | 'warning' | 'danger'> = {
  ok: 'success',
  degraded: 'warning',
  down: 'danger',
};

/** System-health tiles. Status is carried by the chip's text label, not colour. */
export function SystemHealthWidget() {
  const { data, isPending, isError, refetch } = useSystemHealth();

  return (
    <WidgetCard title="System health" count={data?.tiles.length}>
      {isPending ? (
        <div className="flex flex-col gap-1">
          {SKELETON_ROWS.map((id) => (
            <SkeletonRow key={id} />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          message="Could not load system health."
          onRetry={refetch}
        />
      ) : data.tiles.length === 0 ? (
        <EmptyState message="No health checks reported." />
      ) : (
        <ul className="flex min-w-0 flex-col">
          {data.tiles.map((tile) => (
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
    </WidgetCard>
  );
}
