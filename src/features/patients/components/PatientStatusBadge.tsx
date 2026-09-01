import { Ban, CircleDot, CircleDashed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { PatientStatus } from '@/features/patients/types/patient.types';

type BadgeVariant = 'neutral' | 'success' | 'danger';

const CONFIG: Record<
  PatientStatus,
  { label: string; variant: BadgeVariant; icon: LucideIcon }
> = {
  active: {
    label: 'Active',
    variant: 'success',
    icon: CircleDot,
  },
  inactive: {
    label: 'Inactive',
    variant: 'neutral',
    icon: CircleDashed,
  },
  deceased: {
    label: 'Deceased',
    variant: 'danger',
    icon: Ban,
  },
};

interface PatientStatusBadgeProps {
  readonly status: PatientStatus;
}

export function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  const { label, variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
