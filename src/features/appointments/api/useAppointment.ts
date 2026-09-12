import { useQuery } from '@tanstack/react-query';

import { appointmentQueryKeys } from '@/features/appointments/api/appointments.keys';
import { appointmentsRepository } from '@/features/appointments/api/appointmentsRepository';
import type { Appointment } from '@/features/appointments/types/appointment.types';

// Single-appointment detail query, mirroring `useBranch`. `enabled` guards the
// empty-id case (e.g. a detail drawer mounted before a row is selected) so the
// hook never issues `GET /appointments/`.
export function useAppointment(id: string) {
  return useQuery<Appointment>({
    queryKey: appointmentQueryKeys.detail(id),
    queryFn: () => appointmentsRepository.get(id),
    enabled: id.length > 0,
  });
}
