import { useQualitySafety } from '@/features/dashboard/api/qualitySafety.api';
import type { QualitySafetyIndicator } from '@/features/dashboard/types/qualitySafety.types';
import { WidgetCard } from '@/features/dashboard/components/WidgetCard';
import { ErrorBanner } from '@/features/dashboard/components/ErrorBanner';
import { EmptyState } from '@/features/dashboard/components/EmptyState';
import { cn } from '@/lib/utils';

const SKELETON_CELLS = ['a', 'b', 'c', 'd'] as const;
const TILE_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2';

// Colour is never the only channel (I-14): a glyph and a word carry the reading.
const INTENT: Record<
  QualitySafetyIndicator['deltaIntent'],
  { glyph: string; word: string; className: string }
> = {
  good: { glyph: '▲', word: 'Improving', className: 'text-success-text' },
  bad: { glyph: '▼', word: 'Worsening', className: 'text-destructive-text' },
  neutral: { glyph: '–', word: 'Stable', className: 'text-muted-foreground' },
};

/**
 * Board-level quality & safety indicators as a 2×2 tile grid. The widget owns
 * its `WidgetCard`; the tiles inside are plain elements, never nested cards (I-2).
 */
export function QualitySafetyWidget() {
  const { data, isPending, isError, refetch } = useQualitySafety();

  return (
    <WidgetCard title="Quality & safety" count={data?.indicators.length}>
      {isPending ? (
        <div className={TILE_GRID}>
          {SKELETON_CELLS.map((id) => (
            <div
              key={id}
              className="flex min-w-0 flex-col gap-1 rounded-md border bg-muted/30 p-3"
            >
              <div className="h-3 w-28 animate-pulse rounded-sm bg-muted" />
              <div className="h-6 w-16 animate-pulse rounded-sm bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded-sm bg-muted" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner
          message="Could not load quality & safety indicators."
          onRetry={refetch}
        />
      ) : data.indicators.length === 0 ? (
        <EmptyState message="No quality indicators to show." />
      ) : (
        <div className={TILE_GRID}>
          {data.indicators.map((indicator) => {
            const intent = INTENT[indicator.deltaIntent];
            return (
              <div
                key={indicator.id}
                className="flex min-w-0 flex-col gap-1 rounded-md border bg-muted/30 p-3"
              >
                <p className="truncate text-xs text-muted-foreground">
                  {indicator.label}
                </p>
                <p className="font-display text-xl tabular-nums">
                  {indicator.display}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium',
                    intent.className,
                  )}
                >
                  <span aria-hidden="true">{intent.glyph}</span>
                  {intent.word}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
