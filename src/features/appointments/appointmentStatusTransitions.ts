// UX guardrail only — the backend does not enforce a status state machine in
// v1 and this is bypassable via direct API.
//
// Each entry is the set of statuses a user may move an appointment TO from the
// current one. The current status is always re-offered (see
// `allowedStatusOptions`) so the select can render what the record actually
// holds. `COMPLETED` is terminal: nothing follows it.
//
// Lives in its own module rather than beside the form that uses it because a
// `.tsx` file may only export components (`react-refresh/only-export-components`).

import { APPOINTMENT_STATUS_OPTIONS } from '@/features/appointments/appointmentOptions';
import type { SelectOption } from '@/features/appointments/appointmentOptions';
import type { AppointmentStatus } from '@/features/appointments/types/appointment.types';

export const APPOINTMENT_STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  readonly AppointmentStatus[]
> = {
  SCHEDULED: ['CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'],
  CHECKED_IN: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: ['RESCHEDULED'],
  NO_SHOW: ['RESCHEDULED'],
  RESCHEDULED: ['SCHEDULED', 'CONFIRMED', 'CANCELLED'],
};

export function allowedStatusOptions(
  current: AppointmentStatus,
): readonly SelectOption[] {
  const reachable = new Set<string>([
    current,
    ...APPOINTMENT_STATUS_TRANSITIONS[current],
  ]);
  return APPOINTMENT_STATUS_OPTIONS.filter((option) =>
    reachable.has(option.value),
  );
}
