import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAccessControl } from '@/features/dashboard/api/accessControl.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { StatusChip } from '@/features/dashboard/components/StatusChip';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { SkeletonRow } from '@/features/dashboard/components/SkeletonRow';

const SKELETON_ROWS = ['a', 'b', 'c'] as const;

/**
 * "Manage permissions" is a disabled affordance (no permissions route exists).
 * Matches AppSidebar's "Coming soon" pattern: focusable, aria-disabled, tooltip.
 */
function ManagePermissionsAffordance() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="button"
            aria-disabled="true"
            aria-label="Manage permissions — coming soon"
            tabIndex={0}
            onClick={(event) => event.preventDefault()}
            className="inline-flex cursor-default items-center rounded-sm text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Manage permissions
          </span>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Read-only access-control toggles. Each state is spelled out as text. */
export function AccessControlWidget() {
  const { data, isPending, isError, refetch } = useAccessControl();

  return (
    <WidgetCard
      title="Access control"
      count={data?.toggles.length}
      footer={<ManagePermissionsAffordance />}
    >
      {isPending ? (
        <div className="flex flex-col gap-1">
          {SKELETON_ROWS.map((id) => (
            <SkeletonRow key={id} />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          message="Could not load access control."
          onRetry={refetch}
        />
      ) : data.toggles.length === 0 ? (
        <EmptyState message="No access-control settings." />
      ) : (
        <ul className="flex min-w-0 flex-col">
          {data.toggles.map((toggle) => (
            <li
              key={toggle.id}
              className="flex min-w-0 items-center justify-between gap-2 border-b py-2 last:border-b-0"
            >
              <span className="min-w-0 flex-1 truncate text-sm">{toggle.label}</span>
              <StatusChip
                label={toggle.stateLabel}
                variant={toggle.enabled ? 'success' : 'neutral'}
              />
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
