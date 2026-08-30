import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

import { useEdFlow } from '@/features/dashboard/api/edFlow.api';
import { useDischargeReadiness } from '@/features/dashboard/api/dischargeReadiness.api';
import { useReducedMotion } from '@/features/dashboard/useReducedMotion';
import { ChartCard } from '@/features/dashboard/components/ChartCard';
import { DateRangeControl } from '@/features/dashboard/filters/DateRangeControl';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { KpiCardRow } from '@/features/dashboard/components/KpiCardRow';
import { SectionHeading } from '@/features/dashboard/components/SectionHeading';
import { FinancialBillingWidget } from '@/features/dashboard/components/FinancialBillingWidget';
import { TodaysAppointmentsWidget } from '@/features/dashboard/components/TodaysAppointmentsWidget';
import { SystemAlertsWidget } from '@/features/dashboard/components/SystemAlertsWidget';
import { SystemHealthWidget } from '@/features/dashboard/components/SystemHealthWidget';
import { RecentActivityWidget } from '@/features/dashboard/components/RecentActivityWidget';

const EdVolumeWaitChart = lazy(
  () => import('@/features/dashboard/components/EdVolumeWaitChart'),
);
const DischargeReadinessChart = lazy(
  () => import('@/features/dashboard/components/DischargeReadinessChart'),
);

const CHART_FALLBACK = (
  <div className="size-full animate-pulse rounded-lg bg-muted" />
);

interface ChartStateProps<T> {
  readonly query: {
    readonly data: T | undefined;
    readonly isPending: boolean;
    readonly isError: boolean;
    readonly refetch: () => void;
  };
  readonly errorMessage: string;
  readonly emptyMessage: string;
  readonly isEmpty: (data: T) => boolean;
  readonly children: (data: T) => ReactNode;
}

// The pending / error / empty / lazy-chart ladder both chart cards share.
function ChartState<T>({
  query,
  errorMessage,
  emptyMessage,
  isEmpty,
  children,
}: ChartStateProps<T>) {
  if (query.isPending) return CHART_FALLBACK;
  if (query.isError || query.data === undefined) {
    return (
      <div className="flex h-full items-center">
        <ErrorBanner message={errorMessage} onRetry={query.refetch} />
      </div>
    );
  }
  if (isEmpty(query.data)) return <EmptyState message={emptyMessage} />;
  return <Suspense fallback={CHART_FALLBACK}>{children(query.data)}</Suspense>;
}

function EdVolumeWaitCard() {
  const reduced = useReducedMotion();
  const query = useEdFlow();

  return (
    <ChartCard
      title="ED volume & wait time"
      subtitle="Daily visits against average wait (min)"
    >
      <ChartState
        query={query}
        errorMessage="Could not load ED volume and wait time."
        emptyMessage="No ED flow data to show."
        isEmpty={(d) => d.points.length === 0}
      >
        {(d) => <EdVolumeWaitChart data={d.points} animate={!reduced} />}
      </ChartState>
    </ChartCard>
  );
}

function DischargeReadinessCard() {
  const reduced = useReducedMotion();
  const query = useDischargeReadiness();

  return (
    <ChartCard
      title="Discharge readiness"
      subtitle="Currently-admitted patients by readiness"
    >
      <ChartState
        query={query}
        errorMessage="Could not load discharge readiness."
        emptyMessage="No discharge-readiness data to show."
        isEmpty={(d) => d.readyNow + d.readySoon + d.notReady === 0}
      >
        {(d) => <DischargeReadinessChart data={d} animate={!reduced} />}
      </ChartState>
    </ChartCard>
  );
}

export function CmoDashboardPage() {
  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Operations Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor capacity, flow, and performance across the health system.
          </p>
        </div>
        <DateRangeControl />
      </header>

      <KpiCardRow />

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <EdVolumeWaitCard />
        <DischargeReadinessCard />
      </div>

      <FinancialBillingWidget />

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <TodaysAppointmentsWidget />
        <RecentActivityWidget />
      </div>

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHeading
          title="System status"
          subtitle="Platform health and recent activity"
        />
        <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <SystemAlertsWidget />
          <SystemHealthWidget />
        </div>
      </section>
    </div>
  );
}
