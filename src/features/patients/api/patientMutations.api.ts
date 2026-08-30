// Typed write wrappers for the patient endpoints + their react-query mutations.
// INV-14: all HTTP goes through `apiRequest`. The hooks only invalidate the
// patient-list cache on success — navigation + toast stay in the component so
// the pure data layer has nothing UI-shaped to test around.

import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/app/providers/queryClient';
import {
  PATIENTS_QUERY_KEY,
  patientDetailQueryKey,
} from '@/features/patients/api/patients.api';
import { apiRequest } from '@/lib/apiClient';
import type {
  CreatePatientBody,
  PatientWire,
  UpdatePatientBody,
} from '@/features/patients/types/patient.types';

export function createPatient(body: CreatePatientBody): Promise<PatientWire> {
  return apiRequest<PatientWire>('/patients', { method: 'POST', body });
}

export function updatePatient(
  id: string,
  body: UpdatePatientBody,
): Promise<PatientWire> {
  return apiRequest<PatientWire>(`/patients/${id}`, { method: 'PATCH', body });
}

/** `DELETE /patients/:id` — soft-delete on the backend, admin-gated (403 otherwise). */
export function deletePatient(id: string): Promise<null> {
  return apiRequest<null>(`/patients/${id}`, { method: 'DELETE' });
}

function invalidatePatients(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
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
      queryClient.removeQueries({ queryKey: patientDetailQueryKey(id) });
    },
  });
}
