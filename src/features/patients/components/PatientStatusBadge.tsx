import { Ban, CircleDot, CircleDashed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { PatientStatusEnum } from '@/features/patients/types/patient.types';

type BadgeVariant = 'neutral' | 'success' | 'danger';

const CONFIG: Record<
  PatientStatusEnum,
  { label: string; variant: BadgeVariant; icon: LucideIcon }
> = {
  [PatientStatusEnum.ACTIVE]: {
    label: 'Active',
    variant: 'success',
    icon: CircleDot,
  },
  [PatientStatusEnum.INACTIVE]: {
    label: 'Inactive',
    variant: 'neutral',
    icon: CircleDashed,
  },
  [PatientStatusEnum.DECEASED]: {
    label: 'Deceased',
    variant: 'danger',
    icon: Ban,
  },
};

interface PatientStatusBadgeProps {
  readonly status: PatientStatusEnum;
}

/**
 * Status is conveyed by icon + text, never colour alone (WCAG 1.4.1). The label
 * is always spelled out.
 */
export function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  const { label, variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
