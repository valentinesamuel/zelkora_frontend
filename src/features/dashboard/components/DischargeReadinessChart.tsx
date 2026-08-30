import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// Presentation primitive — data comes from the caller (Phase 5 wires the
// `dischargeReadiness` resource). Shape mirrors `dischargeReadiness.types.ts`.
interface DischargeReadiness {
  readyNow: number;
  readySoon: number;
  notReady: number;
}

interface DischargeReadinessChartProps {
  data: DischargeReadiness;
  /** Consumer passes `false` under `prefers-reduced-motion`. */
  animate?: boolean;
}

const SLICES = [
  { key: 'readyNow', label: 'Ready now', color: 'var(--chart-5)' },
  { key: 'readySoon', label: 'Ready <24h', color: 'var(--chart-3)' },
  { key: 'notReady', label: 'Not ready', color: 'var(--chart-4)' },
] as const;

/**
 * Discharge-readiness donut. Legend plus an `sr-only` text summary — the
 * recharts SVG on its own is unreadable to assistive tech. Lazy-loaded.
 */
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
  const summary =
    total === 0
      ? 'No discharge-readiness data available.'
      : `${data.readyNow} ready now, ${data.readySoon} ready within 24 hours, ${data.notReady} not ready, of ${total} inpatients.`;

  return (
    <figure className="h-full w-full min-w-0">
      <figcaption className="sr-only">{summary}</figcaption>
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
            verticalAlign="bottom"
            height={24}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
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
        </PieChart>
      </ResponsiveContainer>
    </figure>
  );
}
