import {
  Ban,
  CalendarClock,
  CalendarSync,
  CheckCheck,
  CircleCheck,
  LogIn,
  Stethoscope,
  UserX,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { AppointmentStatus } from '@/features/appointments/types/appointment.types';

type BadgeVariant = 'neutral' | 'outline' | 'success' | 'warning' | 'danger';

const CONFIG: Record<
  AppointmentStatus,
  { label: string; variant: BadgeVariant; icon: LucideIcon }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    variant: 'neutral',
    icon: CalendarClock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    variant: 'neutral',
    icon: CircleCheck,
  },
  CHECKED_IN: {
    label: 'Checked in',
    variant: 'outline',
    icon: LogIn,
  },
  IN_PROGRESS: {
    label: 'In progress',
    variant: 'outline',
    icon: Stethoscope,
  },
  COMPLETED: {
    label: 'Completed',
    variant: 'success',
    icon: CheckCheck,
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'danger',
    icon: Ban,
  },
  NO_SHOW: {
    label: 'No show',
    variant: 'danger',
    icon: UserX,
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    variant: 'warning',
    icon: CalendarSync,
  },
};

interface AppointmentStatusBadgeProps {
  readonly status: AppointmentStatus;
}

export function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const { label, variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
