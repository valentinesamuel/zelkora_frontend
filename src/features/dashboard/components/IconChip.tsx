import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface IconChipProps {
  icon: LucideIcon;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}

const toneClass: Record<NonNullable<IconChipProps['tone']>, string> = {
  accent: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success-text',
  warning: 'bg-warning/10 text-warning-text',
  danger: 'bg-destructive/10 text-destructive-text',
};

/**
 * A decorative tinted icon tile. `aria-hidden` — it is never the only label for
 * anything it sits beside.
 */
export function IconChip({ icon: Icon, tone = 'accent' }: IconChipProps) {
  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-md',
        toneClass[tone],
      )}
      aria-hidden="true"
    >
      <Icon className="size-4" />
    </span>
  );
}
