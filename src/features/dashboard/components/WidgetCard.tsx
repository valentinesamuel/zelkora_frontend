import type { ReactNode } from 'react';

interface WidgetCardProps {
  title: string;
  subtitle?: string;
  count?: number;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * The single container primitive for every dashboard widget. Replaces the
 * shadcn `Card` — hairline border plus one soft elevation token (`shadow-card`),
 * `rounded-lg` corners, roomy padding.
 * Never nest a WidgetCard inside another WidgetCard.
 */
export function WidgetCard({
  title,
  subtitle,
  count,
  headerRight,
  footer,
  children,
}: WidgetCardProps) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-card min-w-0">
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

      {children}

      {footer && (
        <footer className="flex h-8 items-center border-t pt-3 mt-3 text-sm">
          {footer}
        </footer>
      )}
    </section>
  );
}
