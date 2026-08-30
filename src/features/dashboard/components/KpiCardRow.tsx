import { Activity, BedDouble, DoorOpen, Timer, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardKpis } from '@/features/dashboard/api/dashboardKpis.api';
import { KpiCard, KPI_CARD_SURFACE } from '@/features/dashboard/components/KpiCard';
import { WidgetState } from '@/features/dashboard/components/WidgetState';

type KpiTone = 'accent' | 'success' | 'warning' | 'danger';

// Icon and tint keyed by the KPI's stable id; the data layer carries no icon.
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
  return (
    <div className={KPI_CARD_SURFACE}>
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

export function KpiCardRow() {
  const { data, isPending, isError, refetch } = useDashboardKpis();

  return (
    <WidgetState
      data={data}
      isPending={isPending}
      isError={isError}
      onRetry={refetch}
      skeleton={
        <div className={GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
      }
      errorMessage="Could not load KPIs."
      isEmpty={(d) => d.items.length === 0}
      emptyMessage="No KPIs to show."
    >
      {(d) => (
        <div className={GRID}>
          {d.items.map((item) => {
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
      )}
    </WidgetState>
  );
}
