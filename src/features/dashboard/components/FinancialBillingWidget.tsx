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

/** A single labelled metric tile. Plain element — never a nested WidgetCard (I-2). */
function MetricTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border bg-muted/30 p-3">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-lg tabular-nums">{children}</p>
    </div>
  );
}

const TILE_GRID = 'grid grid-cols-2 gap-3 lg:grid-cols-4';
const DONUT_BOX = 'size-36 shrink-0';

/**
 * One frame, two independent queries: a failure in revenue must not blank the
 * HMO-claims tile and vice versa (I-1).
 *  - revenue error  → ErrorBanner in the headline region; the three revenue
 *    tiles fall back to `—`; the card is never blanked.
 *  - claims error   → only the denial-rate tile degrades to `—` + a small retry.
 */
export function FinancialBillingWidget() {
  const revenue = useRevenueBilling();
  const claims = useHmoClaims();
  const reduced = useReducedMotion();

  const subtitle = claims.data
    ? `${claims.data.summary.pendingCount} HMO claims pending adjudication`
    : undefined;

  const summary = revenue.data?.summary;
  const ratioPct =
    summary && summary.targetMinor > 0
      ? (summary.totalMinor / summary.targetMinor) * 100
      : 0;
  const barWidth = Math.min(Math.max(ratioPct, 0), 100);

  return (
    <WidgetCard title="Financial & billing" subtitle={subtitle}>
      <div className="flex min-w-0 flex-col gap-5">
        <div role="group" aria-label="Revenue against target">
          {revenue.isPending ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="h-3 w-24 animate-pulse rounded-sm bg-muted" />
                <div className="h-9 w-40 animate-pulse rounded-sm bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded-sm bg-muted" />
                <div className="h-2 w-full max-w-xs animate-pulse rounded-full bg-muted" />
              </div>
              <div className={`${DONUT_BOX} animate-pulse rounded-full bg-muted`} />
            </div>
          ) : revenue.isError ? (
            <ErrorBanner
              message="Could not load revenue and billing."
              onRetry={revenue.refetch}
            />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-xs text-muted-foreground">Today&rsquo;s revenue</p>
                <p className="font-display text-3xl tabular-nums">
                  {formatNairaCompact(summary!.totalMinor)}
                </p>
                <p className="text-xs text-muted-foreground">
                  of target {formatNairaCompact(summary!.targetMinor)} ·{' '}
                  <span className="tabular-nums">{formatPercent(ratioPct)}</span> to target
                </p>
                <div
                  role="progressbar"
                  aria-label="Revenue against target"
                  aria-valuenow={Math.round(ratioPct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
              <div className={DONUT_BOX}>
                <Suspense
                  fallback={
                    <div className="size-full animate-pulse rounded-full bg-muted" />
                  }
                >
                  <PayerMixDonut
                    cashMinor={summary!.cashMinor}
                    hmoMinor={summary!.hmoMinor}
                    animate={!reduced}
                  />
                </Suspense>
              </div>
            </div>
          )}
        </div>

        <div className={TILE_GRID}>
          <MetricTile label="Collections rate">
            {summary ? formatPercent(summary.collectionsRatePct) : '—'}
          </MetricTile>
          <MetricTile label="Outstanding AR">
            {summary ? formatNairaCompact(summary.outstandingArMinor) : '—'}
          </MetricTile>
          <MetricTile label="Days in AR">
            {summary ? formatNumber(summary.daysInAr) : '—'}
          </MetricTile>
          <MetricTile label="Claims denial rate">
            {claims.isError ? (
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
            ) : claims.data ? (
              formatPercent(claims.data.summary.denialRatePct)
            ) : (
              <span className="inline-block h-5 w-12 animate-pulse rounded-sm bg-muted align-middle" />
            )}
          </MetricTile>
        </div>
      </div>
    </WidgetCard>
  );
}
