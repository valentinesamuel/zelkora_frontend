import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

interface DeltaBadgeProps {
  value: number;
  label: string;
  intent: 'good' | 'bad' | 'neutral';
}

const intentClass: Record<DeltaBadgeProps['intent'], string> = {
  good: 'text-success-text',
  bad: 'text-destructive-text',
  neutral: 'text-muted-foreground',
};

/**
 * A signed change indicator. Intent is SEMANTIC and decoupled from the sign — a
 * falling ED wait time is `good`. The direction arrow is chosen by `sign(value)`;
 * the colour by `intent`. Colour is never the only channel: the arrow glyph and
 * the `label` text both carry the meaning (WCAG 1.4.1).
 */
export function DeltaBadge({ value, label, intent }: DeltaBadgeProps) {
  const Arrow = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        intentClass[intent],
      )}
    >
      <Arrow className="size-3.5" aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
    </span>
  );
}
