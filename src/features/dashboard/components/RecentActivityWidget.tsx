import { useRecentActivity } from '@/features/dashboard/api/recentActivity.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { WidgetState } from '@/features/dashboard/components/WidgetState';
import { SkeletonList } from '@/features/dashboard/components/SkeletonList';
import { countLabel, formatRelativeTime } from '@/features/dashboard/format';

export function RecentActivityWidget() {
  const { data, isPending, isError, refetch } = useRecentActivity();

  return (
    <WidgetCard title="Recent activity" count={data?.entries.length}>
      <p role="status" aria-live="polite" className="sr-only">
        {data && countLabel(data.entries.length, 'recent update')}
      </p>

      <WidgetState
        data={data}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        skeleton={<SkeletonList rows={4} />}
        errorMessage="Could not load recent activity."
        isEmpty={(d) => d.entries.length === 0}
        emptyMessage="No recent activity."
      >
        {(d) => (
          <div className="min-w-0">
            <ul className="flex min-w-0 flex-col">
              {d.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex min-w-0 items-center gap-3 border-b py-2 last:border-b-0"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-medium">{entry.actorName}</span>{' '}
                    {entry.action}{' '}
                    <span className="text-muted-foreground">
                      {entry.targetLabel}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatRelativeTime(entry.occurredAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </WidgetState>
    </WidgetCard>
  );
}
