import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { EdFlowPoint } from '@/features/dashboard/types/edFlow.types';
import { ChartFigure } from '@/features/dashboard/components/ChartFigure';
import { CHART_TOOLTIP_STYLE } from '@/features/dashboard/components/chartTooltipStyle';

interface EdVolumeWaitChartProps {
  readonly data: EdFlowPoint[];
  readonly animate?: boolean;
}

const AXIS = 'var(--muted-foreground)';

function trendSummary(data: EdFlowPoint[]): string {
  if (data.length === 0) return 'No ED volume or wait-time data available.';

  const first = data.at(0);
  const last = data.at(-1);

  if (!first || !last) {
    return 'No ED volume or wait-time data available.';
  }

  let dir = 'flat';
  if (last.avgWaitMin > first.avgWaitMin) {
    dir = 'up';
  } else if (last.avgWaitMin < first.avgWaitMin) {
    dir = 'down';
  }

  return `ED visits from ${first.visits} on ${first.day} to ${last.visits} on ${last.day}. Average wait ${dir} from ${first.avgWaitMin} to ${last.avgWaitMin} minutes over the period.`;
}

// Lazy-loaded — recharts must never enter the entry bundle.
export default function EdVolumeWaitChart({
  data,
  animate = true,
}: Readonly<EdVolumeWaitChartProps>) {
  return (
    <ChartFigure summary={trendSummary(data)}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            stroke={AXIS}
          />
          <YAxis
            yAxisId="visits"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={32}
            stroke={AXIS}
          />
          <YAxis
            yAxisId="wait"
            orientation="right"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={32}
            stroke={AXIS}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Bar
            yAxisId="visits"
            dataKey="visits"
            name="Visits"
            fill="var(--chart-2)"
            radius={[2, 2, 0, 0]}
            isAnimationActive={animate}
          />
          <Line
            yAxisId="wait"
            type="monotone"
            dataKey="avgWaitMin"
            name="Avg wait (min)"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={animate}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}
