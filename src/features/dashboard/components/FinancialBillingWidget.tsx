import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

import { useRevenueBilling } from '@/features/dashboard/api/revenueBilling.api';
import { useHmoClaims } from '@/features/dashboard/api/hmoClaims.api';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { useReducedMotion } from '@/features/dashboard/useReducedMotion';
import {
  formatNairaCompact,
  formatNumber,
  formatPercent,
} from '@/features/dashboard/format';

const PayerMixDonut = lazy(
  () => import('@/features/dashboard/components/PayerMixDonut'),
);

function MetricTile({
  label,
  children,
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border bg-muted/30 p-3">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-lg tabular-nums">{children}</p>
    </div>
  );
}

const ROW_GRID =
  'grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,3fr)]';
const TILE_GRID = 'grid grid-cols-2 gap-3';

export function FinancialBillingWidget() {
  const revenue = useRevenueBilling();
  const claims = useHmoClaims();
  const reduced = useReducedMotion();

  let claimsSubtitle: string | undefined;
  if (claims.data) {
    claimsSubtitle = `${claims.data.summary.pendingCount} HMO claims pending adjudication`;
  }

  const summary = revenue.data?.summary;

  let collectionsRate = '—';
  let outstandingAr = '—';
  let daysInAr = '—';
  if (summary) {
    collectionsRate = formatPercent(summary.collectionsRatePct);
    outstandingAr = formatNairaCompact(summary.outstandingArMinor);
    daysInAr = formatNumber(summary.daysInAr);
  }

  let denialRateContent: ReactNode;

  if (claims.isError) {
    denialRateContent = (
      <span className="inline-flex items-center gap-2">
        <span>—</span>
        <button
          type="button"
          onClick={() => claims.refetch()}
          className="rounded-sm border px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Retry
        </button>
      </span>
    );
  } else if (claims.data) {
    denialRateContent = formatPercent(claims.data.summary.denialRatePct);
  } else {
    denialRateContent = (
      <span className="inline-block h-5 w-12 animate-pulse rounded-sm bg-muted align-middle" />
    );
  }

  let revenueContent: ReactNode;

  if (revenue.isError) {
    revenueContent = (
      <ErrorBanner
        message="Could not load revenue and billing."
        onRetry={revenue.refetch}
      />
    );
  } else if (revenue.isSuccess) {
    const s = revenue.data.summary;
    let toTargetPct = 0;
    if (s.targetMinor > 0) {
      toTargetPct = (s.totalMinor / s.targetMinor) * 100;
    }
    revenueContent = (
      <div className="flex min-w-0 flex-col gap-2">
        <p className="font-display text-3xl tabular-nums">
          {formatNairaCompact(s.totalMinor)}
        </p>
        <p className="text-xs text-muted-foreground">
          of target {formatNairaCompact(s.targetMinor)} ·{' '}
          <span className="tabular-nums">{formatPercent(toTargetPct)}</span> to
          target
        </p>
        <progress
          aria-label="Revenue against target"
          value={Math.round(toTargetPct)}
          max={100}
          className="h-2 w-full overflow-hidden rounded-full bg-muted accent-primary"
        />
      </div>
    );
  } else {
    revenueContent = (
      <div className="flex flex-col gap-2">
        <div className="h-9 w-40 animate-pulse rounded-sm bg-muted" />
        <div className="h-3 w-48 animate-pulse rounded-sm bg-muted" />
        <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  let payerMixContent: ReactNode;

  if (revenue.isError) {
    payerMixContent = (
      <p className="text-xs text-muted-foreground">Payer mix unavailable.</p>
    );
  } else if (revenue.isSuccess) {
    const s = revenue.data.summary;
    payerMixContent = (
      <div className="size-40">
        <Suspense
          fallback={
            <div className="size-full animate-pulse rounded-full bg-muted" />
          }
        >
          <PayerMixDonut
            cashMinor={s.cashMinor}
            hmoMinor={s.hmoMinor}
            animate={!reduced}
          />
        </Suspense>
      </div>
    );
  } else {
    payerMixContent = (
      <div className="size-40 animate-pulse rounded-full bg-muted" />
    );
  }

  return (
    <div className={ROW_GRID}>
      <WidgetCard
        title="Today's revenue"
        subtitle="Against daily target"
        contentClassName="flex flex-col justify-end"
      >
        {revenueContent}
      </WidgetCard>

      <WidgetCard title="Collections & AR" subtitle={claimsSubtitle}>
        <div className={TILE_GRID}>
          <MetricTile label="Collections rate">{collectionsRate}</MetricTile>
          <MetricTile label="Outstanding AR">{outstandingAr}</MetricTile>
          <MetricTile label="Days in AR">{daysInAr}</MetricTile>
          <MetricTile label="Claims denial rate">
            {denialRateContent}
          </MetricTile>
        </div>
      </WidgetCard>

      <WidgetCard title="Payer mix" subtitle="Cash against HMO">
        <div className="flex items-center justify-center py-1">
          {payerMixContent}
        </div>
      </WidgetCard>
    </div>
  );
}
