import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/app/providers/queryClient';
import { patientQueryKeys } from '@/features/patients/api/patients.keys';
import { apiRequest } from '@/lib/apiClient';
import type {
  CreatePatientBody,
  Patient,
  UpdatePatientBody,
} from '@/features/patients/types/patient.types';

export function createPatient(body: CreatePatientBody): Promise<Patient> {
  return apiRequest<Patient>('/patients', { method: 'POST', body });
}

export function updatePatient(
  id: string,
  body: UpdatePatientBody,
): Promise<Patient> {
  return apiRequest<Patient>(`/patients/${id}`, { method: 'PATCH', body });
}

export function deletePatient(id: string): Promise<null> {
  return apiRequest<null>(`/patients/${id}`, { method: 'DELETE' });
}

function invalidatePatients(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: patientQueryKeys.all });
}

export function useCreatePatient() {
  return useMutation({
    mutationFn: createPatient,
    onSuccess: invalidatePatients,
  });
}

export function useUpdatePatient(id: string) {
  return useMutation({
    mutationFn: (body: UpdatePatientBody) => updatePatient(id, body),
    onSuccess: invalidatePatients,
  });
}

export function useDeletePatient(id: string) {
  return useMutation({
    mutationFn: () => deletePatient(id),
    onSuccess: async () => {
      await invalidatePatients();
      queryClient.removeQueries({ queryKey: patientQueryKeys.detail(id) });
    },
  });
}
