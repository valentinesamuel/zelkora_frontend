import type { LucideIcon } from 'lucide-react';

import { DeltaBadge } from '@/features/dashboard/components/DeltaBadge';
import { IconChip } from '@/features/dashboard/components/IconChip';
import { Sparkline } from '@/features/dashboard/components/Sparkline';

interface KpiCardProps {
  icon: LucideIcon;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  label: string;
  /** Pre-formatted by the caller — this component never formats. */
  value: string;
  delta: number;
  deltaLabel: string;
  deltaIntent: 'good' | 'bad' | 'neutral';
  spark: number[];
}

/**
 * A single KPI stat: icon chip, label, big value, signed delta, sparkline.
 * NOT a `WidgetCard` (invariant I-2) — its own bordered, `rounded-lg`,
 * `shadow-card` surface.
 */
export function KpiCard({
  icon,
  tone,
  label,
  value,
  delta,
  deltaLabel,
  deltaIntent,
  spark,
}: KpiCardProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <IconChip icon={icon} tone={tone} />
        <Sparkline values={spark} className="mt-1 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-3xl tabular-nums">{value}</p>
      </div>

      <DeltaBadge value={delta} label={deltaLabel} intent={deltaIntent} />
    </div>
  );
}
