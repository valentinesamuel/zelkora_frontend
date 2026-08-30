import { sparkPoints } from '@/lib/sparkline';
import { cn } from '@/lib/utils';

interface SparklineProps {
  values: number[];
  className?: string;
}

/**
 * A tiny inline-SVG trend line. Hand-rolled — no recharts. Renders nothing when
 * there are fewer than two points (a single point or none is not a trend).
 * `stroke` is `currentColor`, so the caller sets the hue with a text colour.
 */
export function Sparkline({ values, className }: SparklineProps) {
  if (values.length < 2) return null;

  return (
    <svg
      viewBox="0 0 64 20"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('h-5 w-16', className)}
    >
      <polyline
        points={sparkPoints(values, 64, 20)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
