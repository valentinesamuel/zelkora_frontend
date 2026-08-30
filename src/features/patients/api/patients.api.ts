import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { patientsRepository } from '@/features/patients/api/patientsRepository';
import { serializePatientListParams } from '@/features/patients/filters/patientListParams';
import { apiRequest } from '@/lib/apiClient';
import type { Patient } from '@/features/patients/types/patient.types';
import type {
  PatientListQuery,
  PatientListResult,
} from '@/features/patients/types/patientListQuery.types';

export const PATIENTS_QUERY_KEY = 'patients';

export function patientsQueryKey(query: PatientListQuery) {
  return [PATIENTS_QUERY_KEY, serializePatientListParams(query)] as const;
}

export function usePatients(query: PatientListQuery) {
  return useQuery<PatientListResult>({
    queryKey: patientsQueryKey(query),
    queryFn: () => patientsRepository.list(query),
    placeholderData: keepPreviousData,
  });
}

export function getPatient(id: string): Promise<Patient> {
  return apiRequest<Patient>(`/patients/${id}`);
}

export function patientDetailQueryKey(patientId: string) {
  return [PATIENTS_QUERY_KEY, 'detail', patientId] as const;
}

export function usePatient(patientId: string) {
  return useQuery<Patient>({
    queryKey: patientDetailQueryKey(patientId),
    queryFn: () => getPatient(patientId),
    enabled: patientId.length > 0,
  });
}
