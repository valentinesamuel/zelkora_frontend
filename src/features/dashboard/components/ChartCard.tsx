import type { ReactNode } from 'react';

interface ChartCardProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
}

// The body is a fixed height (`--chart-card-h`) and `w-full min-w-0` so a
// recharts `ResponsiveContainer` inside it can never resolve to `height: 0`.
export function ChartCard({
  title,
  subtitle,
  action,
  children,
}: ChartCardProps) {
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
