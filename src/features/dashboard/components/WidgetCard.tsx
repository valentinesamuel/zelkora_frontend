import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface WidgetCardProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly count?: number;
  readonly headerRight?: ReactNode;
  readonly footer?: ReactNode;
  // Applied to the body between header and footer, e.g. `flex flex-col
  // justify-end` to pin the content to the bottom of a stretched card.
  readonly contentClassName?: string;
  readonly children: ReactNode;
}

// The container primitive for every dashboard widget. Never nest one inside
// another.
export function WidgetCard({
  title,
  subtitle,
  count,
  headerRight,
  footer,
  contentClassName,
  children,
}: WidgetCardProps) {
  return (
    <section className="flex min-w-0 flex-col rounded-lg border bg-card p-5 shadow-card">
      <header className="flex min-h-8 items-center justify-between gap-3 border-b pb-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-sm font-medium min-w-0 truncate">
            {title}
            {count !== undefined && (
              <span className="text-muted-foreground"> · {count}</span>
            )}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {headerRight && (
          <div className="flex items-center shrink-0">{headerRight}</div>
        )}
      </header>

      <div className={cn('min-w-0 flex-1', contentClassName)}>{children}</div>

      {footer && (
        <footer className="flex h-8 items-center border-t pt-3 mt-3 text-sm">
          {footer}
        </footer>
      )}
    </section>
  );
}
