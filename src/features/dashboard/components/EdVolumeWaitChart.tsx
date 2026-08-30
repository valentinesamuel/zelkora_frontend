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

// Presentation primitive — data comes from the caller (Phase 5 wires the
// `edFlow` resource). Shape mirrors `edFlow.types.ts` structurally.
interface EdFlowPoint {
  day: string;
  visits: number;
  avgWaitMin: number;
}

interface EdVolumeWaitChartProps {
  data: EdFlowPoint[];
  /** Consumer passes `false` under `prefers-reduced-motion`. */
  animate?: boolean;
}

const AXIS = 'var(--muted-foreground)';

function trendSummary(data: EdFlowPoint[]): string {
  if (data.length === 0) return 'No ED volume or wait-time data available.';
  const first = data[0];
  const last = data[data.length - 1];
  const dir =
    last.avgWaitMin > first.avgWaitMin
      ? 'up'
      : last.avgWaitMin < first.avgWaitMin
        ? 'down'
        : 'flat';
  return `ED visits from ${first.visits} on ${first.day} to ${last.visits} on ${last.day}. Average wait ${dir} from ${first.avgWaitMin} to ${last.avgWaitMin} minutes over the period.`;
}

/**
 * ED daily visit volume (bars, left axis) against average wait minutes (line,
 * right axis). Lazy-loaded — recharts must never enter the entry bundle.
 */
export default function EdVolumeWaitChart({
  data,
  animate = true,
}: EdVolumeWaitChartProps) {
  return (
    <figure className="h-full w-full min-w-0">
      <figcaption className="sr-only">{trendSummary(data)}</figcaption>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
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
          <Tooltip
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--popover-foreground)',
              fontSize: 12,
            }}
          />
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
    </figure>
  );
}
