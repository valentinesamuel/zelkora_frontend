import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { formatNairaCompact } from '@/features/dashboard/format';
import { ChartFigure } from '@/features/dashboard/components/ChartFigure';

interface PayerMixDonutProps {
  readonly cashMinor: number;
  readonly hmoMinor: number;
  readonly animate?: boolean;
}

// Two-slice cash / HMO donut with the combined total in the centre. Lazy-loaded.
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
  const summary = `Payer mix: ${formatNairaCompact(cashMinor)} cash, ${formatNairaCompact(
    hmoMinor,
  )} HMO, ${formatNairaCompact(total)} total.`;

  return (
    <ChartFigure summary={summary} className="relative">
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
    </ChartFigure>
  );
}
