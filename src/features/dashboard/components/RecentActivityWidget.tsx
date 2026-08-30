import { useRecentActivity } from '@/features/dashboard/api/recentActivity.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { SkeletonRow } from '@/features/dashboard/components/SkeletonRow';
import { formatRelativeTime } from '@/features/dashboard/format';

const SKELETON_ROWS = ['a', 'b', 'c', 'd'] as const;

function activityCount(count: number): string {
  return `${count} recent update${count === 1 ? '' : 's'}`;
}

/** Recent-activity audit feed. The live region announces a count summary only. */
export function RecentActivityWidget() {
  const { data, isPending, isError, refetch } = useRecentActivity();

  return (
    <WidgetCard title="Recent activity" count={data?.entries.length}>
      <p role="status" aria-live="polite" className="sr-only">
        {data ? activityCount(data.entries.length) : ''}
      </p>

      {isPending ? (
        <div className="flex flex-col gap-1">
          {SKELETON_ROWS.map((id) => (
            <SkeletonRow key={id} />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          message="Could not load recent activity."
          onRetry={refetch}
        />
      ) : data.entries.length === 0 ? (
        <EmptyState message="No recent activity." />
      ) : (
        <div className="min-w-0">
          <ul className="flex min-w-0 flex-col">
            {data.entries.map((entry) => (
              <li
                key={entry.id}
                className="flex min-w-0 items-center gap-3 border-b py-2 last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-medium">{entry.actorName}</span> {entry.action}{' '}
                  <span className="text-muted-foreground">{entry.targetLabel}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {formatRelativeTime(entry.occurredAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </WidgetCard>
  );
}
