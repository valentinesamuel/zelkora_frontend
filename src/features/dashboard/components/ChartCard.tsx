import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Card chrome for a chart. The body is a FIXED height (`--chart-card-h`) and
 * `w-full min-w-0`, so a recharts `ResponsiveContainer` inside it can never
 * resolve to `height: 0`. No consumer may bypass the fixed-height body.
 */
export function ChartCard({ title, subtitle, action, children }: ChartCardProps) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-card min-w-0">
      <header className="mb-3 flex min-h-8 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">{title}</h3>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      <div className="h-[var(--chart-card-h)] w-full min-w-0">{children}</div>
    </section>
  );
}
