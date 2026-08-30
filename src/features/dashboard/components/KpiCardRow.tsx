import { Activity, BedDouble, DoorOpen, Timer, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardKpis } from '@/features/dashboard/api/dashboardKpis.api';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { KpiCard } from '@/features/dashboard/components/KpiCard';

type KpiTone = 'accent' | 'success' | 'warning' | 'danger';

// Presentation-only decoration keyed by the KPI's stable id. `spark` and
// `deltaIntent` now come straight off the item (Phase 4 made them required);
// only the icon and tint live here, because the data layer carries no icon.
const KPI_DECOR: Record<string, { icon: LucideIcon; tone: KpiTone }> = {
  'kpi-ed-average-wait': { icon: Timer, tone: 'accent' },
  'kpi-inpatient-occupancy': { icon: BedDouble, tone: 'warning' },
  'kpi-awaiting-discharge': { icon: DoorOpen, tone: 'accent' },
  'kpi-nursing-overtime': { icon: Users, tone: 'warning' },
};

const FALLBACK_DECOR: { icon: LucideIcon; tone: KpiTone } = {
  icon: Activity,
  tone: 'accent',
};

const GRID = 'grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';

function KpiCardSkeleton() {
  // Same box model as KpiCard — identical padding, gaps and block heights — so
  // the pending state occupies exactly the loaded card's footprint.
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

/**
 * Owns `useDashboardKpis()` and renders the KPI card grid, with its own pending,
 * error and empty states.
 */
export function KpiCardRow() {
  const { data, isPending, isError, refetch } = useDashboardKpis();

  if (isPending) {
    return (
      <div className={GRID}>
        {[0, 1, 2, 3].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorBanner message="Could not load KPIs." onRetry={refetch} />;
  }

  if (data.items.length === 0) {
    return <EmptyState message="No KPIs to show." />;
  }

  return (
    <div className={GRID}>
      {data.items.map((item) => {
        const decor = KPI_DECOR[item.id] ?? FALLBACK_DECOR;
        return (
          <KpiCard
            key={item.id}
            icon={decor.icon}
            tone={decor.tone}
            label={item.label}
            value={item.display}
            delta={item.delta}
            deltaLabel={item.deltaLabel}
            deltaIntent={item.deltaIntent}
            spark={item.spark}
          />
        );
      })}
    </div>
  );
}
