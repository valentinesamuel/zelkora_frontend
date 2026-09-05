import { CircleDashed, CircleDot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'neutral' | 'success';

// Branch has only active/inactive — no `deceased` third state — so a small
// dedicated badge rather than bending `PatientStatusBadge`.
const CONFIG: Record<
  'active' | 'inactive',
  { label: string; variant: BadgeVariant; icon: LucideIcon }
> = {
  active: { label: 'Active', variant: 'success', icon: CircleDot },
  inactive: { label: 'Inactive', variant: 'neutral', icon: CircleDashed },
};

interface BranchStatusBadgeProps {
  readonly isActive: boolean;
}

export function BranchStatusBadge({ isActive }: BranchStatusBadgeProps) {
  let key: 'active' | 'inactive' = 'inactive';
  if (isActive) {
    key = 'active';
  }
  const { label, variant, icon: Icon } = CONFIG[key];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
