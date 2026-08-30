// The query the list page issues, and the result it gets back.
//
// Pagination is CURSOR-based end to end (product decision): the URL carries an
// opaque `cursor` + `limit`; navigation is Prev / Next only. `patientListParams`
// owns the URL <-> query serde; `patientsRepository` owns cursor <-> result.

import type {
  Patient,
  PatientSex,
  PatientStatus,
} from '@/features/patients/types/patient.types';

export type PatientSortField = 'name' | 'age' | 'registeredAt';
export type SortDir = 'asc' | 'desc';

export type PatientStatusFilter = PatientStatus | 'all';
export type PatientSexFilter = PatientSex | 'all';

/** Fully-resolved list state. Every field has a concrete default (see `patientListParams`). */
export interface PatientListQuery {
  readonly search: string;
  readonly status: PatientStatusFilter;
  readonly sex: PatientSexFilter;
  readonly ageMin: number | null;
  readonly ageMax: number | null;
  readonly registeredFrom: string | null; // "YYYY-MM-DD"
  readonly registeredTo: string | null; // "YYYY-MM-DD"
  readonly sortField: PatientSortField;
  readonly sortDir: SortDir;
  readonly cursor: string | null;
  readonly limit: number;
}

export interface PatientPageInfo {
  readonly nextCursor: string | null;
  readonly prevCursor: string | null;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

export interface PatientListResult {
  readonly patients: Patient[];
  readonly pageInfo: PatientPageInfo;
  // Optional: a real cursor API may not return a stable total.
  readonly total: number | null;
}
