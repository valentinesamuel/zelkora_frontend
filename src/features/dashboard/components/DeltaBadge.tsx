import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

interface DeltaBadgeProps {
  readonly value: number;
  readonly label: string;
  readonly intent: 'good' | 'bad' | 'neutral';
}

const intentClass: Record<DeltaBadgeProps['intent'], string> = {
  good: 'text-success-text',
  bad: 'text-destructive-text',
  neutral: 'text-muted-foreground',
};

function SignArrow({ value }: { value: number }) {
  const className = 'size-3.5';
  if (value > 0)
    return <ArrowUpRight className={className} aria-hidden="true" />;
  if (value < 0)
    return <ArrowDownRight className={className} aria-hidden="true" />;
  return <Minus className={className} aria-hidden="true" />;
}

// Intent is semantic, not the sign — a falling ED wait is `good`. Arrow from
// sign(value), colour from intent; glyph and label carry the meaning, not colour
// alone (WCAG 1.4.1).
export function DeltaBadge({ value, label, intent }: DeltaBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        intentClass[intent],
      )}
    >
      <SignArrow value={value} />
      <span className="tabular-nums">{label}</span>
    </span>
  );
}
