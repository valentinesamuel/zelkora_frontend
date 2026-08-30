import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ChartFigureProps {
  // sr-only sentence describing the chart — the Recharts SVG alone is unreadable
  // to assistive tech.
  readonly summary: string;
  readonly className?: string;
  readonly children: ReactNode;
}

export function ChartFigure({ summary, className, children }: ChartFigureProps) {
  return (
    <figure className={cn('h-full w-full min-w-0', className)}>
      <figcaption className="sr-only">{summary}</figcaption>
      {children}
    </figure>
  );
}
