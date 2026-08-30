import { cn } from '@/lib/utils';

interface StatusChipProps {
  readonly label: string;
  readonly variant?: 'neutral' | 'success' | 'warning' | 'danger';
}

const variantClassName: Record<
  NonNullable<StatusChipProps['variant']>,
  string
> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  success: 'bg-success/10 text-success-text border-success/30',
  warning: 'bg-warning/10 text-warning-text border-warning/30',
  danger: 'bg-destructive/10 text-destructive-text border-destructive/30',
};

export function StatusChip({ label, variant = 'neutral' }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-medium',
        variantClassName[variant]
      )}
    >
      {label}
    </span>
  );
}
