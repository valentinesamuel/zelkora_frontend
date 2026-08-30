// The patient-list query hook + single-patient read. Server state only — URL
// state lives in `usePatientListParams`, UI state stays local to components.
//
// `keepPreviousData` keeps the current page on screen while the next page /
// a changed filter loads, so the table never flashes to skeleton after first
// paint (same choice as `createDashboardQuery`).

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { patientsRepository } from '@/features/patients/api/patientsRepository';
import { serializePatientListParams } from '@/features/patients/filters/patientListParams';
import { apiRequest } from '@/lib/apiClient';
import type { PatientWire } from '@/features/patients/types/patient.types';
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

/** `GET /patients/:id` — the raw wire record, used to hydrate the edit form. */
export function getPatient(id: string): Promise<PatientWire> {
  return apiRequest<PatientWire>(`/patients/${id}`);
}

export function patientDetailQueryKey(patientId: string) {
  return [PATIENTS_QUERY_KEY, 'detail', patientId] as const;
}

export function usePatient(patientId: string) {
  return useQuery<PatientWire>({
    queryKey: patientDetailQueryKey(patientId),
    queryFn: () => getPatient(patientId),
    enabled: patientId.length > 0,
  });
}
