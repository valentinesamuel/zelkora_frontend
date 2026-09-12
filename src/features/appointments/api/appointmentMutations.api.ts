import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/app/providers/queryClient';
import { appointmentQueryKeys } from '@/features/appointments/api/appointments.keys';
import { appointmentsRepository } from '@/features/appointments/api/appointmentsRepository';
import type {
  CreateAppointmentBody,
  UpdateAppointmentBody,
} from '@/features/appointments/types/appointment.types';

// Invalidates the whole `['appointments']` subtree. That is required, not
// incidental: a create, a reschedule or a status change alters which slots a
// staff member has free, so every cached page of every list query is stale —
// not just the one the mutated row happens to sit on.
function invalidateAppointments(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all });
}

export function useCreateAppointment() {
  return useMutation({
    mutationFn: (body: CreateAppointmentBody) =>
      appointmentsRepository.create(body),
    onSuccess: invalidateAppointments,
  });
}

export function useUpdateAppointment(id: string) {
  return useMutation({
    mutationFn: (body: UpdateAppointmentBody) =>
      appointmentsRepository.update(id, body),
    onSuccess: async () => {
      await invalidateAppointments();
      await queryClient.invalidateQueries({
        queryKey: appointmentQueryKeys.detail(id),
      });
    },
  });
}

export function useDeleteAppointment(id: string) {
  return useMutation({
    mutationFn: () => appointmentsRepository.remove(id),
    onSuccess: async () => {
      await invalidateAppointments();
      queryClient.removeQueries({ queryKey: appointmentQueryKeys.detail(id) });
    },
  });
}
