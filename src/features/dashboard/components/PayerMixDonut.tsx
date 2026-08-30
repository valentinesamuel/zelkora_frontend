import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { formatNairaCompact } from '@/features/dashboard/format';

interface PayerMixDonutProps {
  cashMinor: number;
  hmoMinor: number;
  /** Consumer passes `false` under `prefers-reduced-motion`. */
  animate?: boolean;
}

/**
 * Two-slice cash / HMO donut with the combined total in the centre. Lazy-loaded
 * — recharts must never enter the entry bundle.
 */
export default function PayerMixDonut({
  cashMinor,
  hmoMinor,
  animate = true,
}: PayerMixDonutProps) {
  const rows = [
    { name: 'Cash', value: Math.max(cashMinor, 0), color: 'var(--chart-1)' },
    { name: 'HMO', value: Math.max(hmoMinor, 0), color: 'var(--chart-2)' },
  ];
  const total = cashMinor + hmoMinor;

  return (
    <figure className="relative h-full w-full min-w-0">
      <figcaption className="sr-only">
        {`Payer mix: ${formatNairaCompact(cashMinor)} cash, ${formatNairaCompact(
          hmoMinor,
        )} HMO, ${formatNairaCompact(total)} total.`}
      </figcaption>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="name"
            innerRadius="64%"
            outerRadius="84%"
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={animate}
          >
            {rows.map((r) => (
              <Cell key={r.name} fill={r.color} stroke="var(--card)" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg tabular-nums">
          {formatNairaCompact(total)}
        </span>
        <span className="text-xs text-muted-foreground">Total</span>
      </div>
    </figure>
  );
}
