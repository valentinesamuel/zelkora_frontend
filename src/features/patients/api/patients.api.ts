// The patient-list query hook. Server state only — URL state lives in
// `usePatientListParams`, UI state stays local to components.
//
// `keepPreviousData` keeps the current page on screen while the next page /
// a changed filter loads, so the table never flashes to skeleton after first
// paint (same choice as `createDashboardQuery`).

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fixturePatientsRepository } from '@/features/patients/api/patientsRepository';
import { serializePatientListParams } from '@/features/patients/filters/patientListParams';
import type {
  PatientListQuery,
  PatientListResult,
} from '@/features/patients/types/patientListQuery.types';

// Single indirection point — swap for the live repository here.
const patientsRepository = fixturePatientsRepository;

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
