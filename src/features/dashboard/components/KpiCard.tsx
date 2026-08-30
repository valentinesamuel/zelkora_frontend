import type { LucideIcon } from 'lucide-react';

import { DeltaBadge } from '@/features/dashboard/components/DeltaBadge';
import { IconChip } from '@/features/dashboard/components/IconChip';
import { Sparkline } from '@/features/dashboard/components/Sparkline';

// Card surface shared with `KpiCardSkeleton` so the pending state matches the
// loaded card's footprint exactly.
export const KPI_CARD_SURFACE =
  'flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-5 shadow-card';

interface KpiCardProps {
  readonly icon: LucideIcon;
  readonly tone?: 'accent' | 'success' | 'warning' | 'danger';
  readonly label: string;
  // Pre-formatted by the caller — this component never formats.
  readonly value: string;
  readonly delta: number;
  readonly deltaLabel: string;
  readonly deltaIntent: 'good' | 'bad' | 'neutral';
  readonly spark: readonly number[];
}

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
    <div className={KPI_CARD_SURFACE}>
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
