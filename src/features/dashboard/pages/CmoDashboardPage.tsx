import { lazy, Suspense } from 'react';

import { useEdFlow } from '@/features/dashboard/api/edFlow.api';
import { useDischargeReadiness } from '@/features/dashboard/api/dischargeReadiness.api';
import { useReducedMotion } from '@/features/dashboard/useReducedMotion';
import { ChartCard } from '@/features/dashboard/components/ChartCard';
import { DashboardFilterBar } from '@/features/dashboard/components/DashboardFilterBar';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { KpiCardRow } from '@/features/dashboard/components/KpiCardRow';
import { SectionHeading } from '@/features/dashboard/components/SectionHeading';
import { FinancialBillingWidget } from '@/features/dashboard/components/FinancialBillingWidget';
import { TodaysAppointmentsWidget } from '@/features/dashboard/components/TodaysAppointmentsWidget';
import { QualitySafetyWidget } from '@/features/dashboard/components/QualitySafetyWidget';
import { SystemAlertsWidget } from '@/features/dashboard/components/SystemAlertsWidget';
import { SystemHealthWidget } from '@/features/dashboard/components/SystemHealthWidget';
// import { AccessControlWidget } from '@/features/dashboard/components/AccessControlWidget';
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

/**
 * Owns `useEdFlow()` — its own pending / error / empty states, so a failed
 * ED-flow query never blanks the rest of the board (I-1). The lazy recharts
 * chunk mounts only on success, inside `ChartCard`'s fixed-height body.
 */
function EdVolumeWaitCard() {
  const reduced = useReducedMotion();
  const { data, isPending, isError, refetch } = useEdFlow();

  return (
    <ChartCard
      title="ED volume & wait time"
      subtitle="Daily visits against average wait (min)"
    >
      {isPending ? (
        CHART_FALLBACK
      ) : isError ? (
        <div className="flex h-full items-center">
          <ErrorBanner
            message="Could not load ED volume and wait time."
            onRetry={refetch}
          />
        </div>
      ) : data.points.length === 0 ? (
        <EmptyState message="No ED flow data to show." />
      ) : (
        <Suspense fallback={CHART_FALLBACK}>
          <EdVolumeWaitChart data={data.points} animate={!reduced} />
        </Suspense>
      )}
    </ChartCard>
  );
}

/** Owns `useDischargeReadiness()` with the same independent-failure contract. */
function DischargeReadinessCard() {
  const reduced = useReducedMotion();
  const { data, isPending, isError, refetch } = useDischargeReadiness();

  const isEmpty =
    data !== undefined &&
    data.readyNow + data.readySoon + data.notReady === 0;

  return (
    <ChartCard
      title="Discharge readiness"
      subtitle="Currently-admitted patients by readiness"
    >
      {isPending ? (
        CHART_FALLBACK
      ) : isError ? (
        <div className="flex h-full items-center">
          <ErrorBanner
            message="Could not load discharge readiness."
            onRetry={refetch}
          />
        </div>
      ) : isEmpty ? (
        <EmptyState message="No discharge-readiness data to show." />
      ) : (
        <Suspense fallback={CHART_FALLBACK}>
          <DischargeReadinessChart data={data} animate={!reduced} />
        </Suspense>
      )}
    </ChartCard>
  );
}

/**
 * CMO home — a clinical-operations executive view. Every widget owns its own
 * query, loading, error and empty handling: there is no page-level state and no
 * hoisted query here (I-1), so one failing domain never blanks the board.
 */
export function CmoDashboardPage() {
  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <header className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Operations Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor capacity, flow, and performance across the health system.
        </p>
      </header>

      <DashboardFilterBar />

      <KpiCardRow />

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <EdVolumeWaitCard />
        <DischargeReadinessCard />
      </div>

      <FinancialBillingWidget />

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <TodaysAppointmentsWidget />
        <QualitySafetyWidget />
      </div>

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHeading
          title="System status"
          subtitle="Platform health and recent activity"
        />
        <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <SystemAlertsWidget />
          <SystemHealthWidget />
          {/* <AccessControlWidget /> */}
          <RecentActivityWidget />
        </div>
      </section>
    </div>
  );
}
