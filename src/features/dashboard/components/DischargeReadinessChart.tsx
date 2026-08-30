import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { DischargeReadinessResponse } from '@/features/dashboard/types/dischargeReadiness.types';
import { ChartFigure } from '@/features/dashboard/components/ChartFigure';
import { CHART_TOOLTIP_STYLE } from '@/features/dashboard/components/chartTooltipStyle';

interface DischargeReadinessChartProps {
  readonly data: DischargeReadinessResponse;
  readonly animate?: boolean;
}

const SLICES = [
  { key: 'readyNow', label: 'Ready now', color: 'var(--chart-5)' },
  { key: 'readySoon', label: 'Ready <24h', color: 'var(--chart-3)' },
  { key: 'notReady', label: 'Not ready', color: 'var(--chart-4)' },
] as const;

export default function DischargeReadinessChart({
  data,
  animate = true,
}: DischargeReadinessChartProps) {
  const rows = SLICES.map((s) => ({
    name: s.label,
    value: data[s.key],
    color: s.color,
  }));
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  let summary = 'No discharge-readiness data available.';
  if (total !== 0) {
    summary = `${data.readyNow} ready now, ${data.readySoon} ready within 24 hours, ${data.notReady} not ready, of ${total} inpatients.`;
  }

  return (
    <ChartFigure summary={summary}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            isAnimationActive={animate}
          >
            {rows.map((r) => (
              <Cell key={r.name} fill={r.color} stroke="var(--card)" />
            ))}
          </Pie>
          <Legend
            // verticalAlign="bottom"
            height={24}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}
