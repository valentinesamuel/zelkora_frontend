export type PatientSortField = 'name' | 'age' | 'registeredAt';
export type SortDir = 'asc' | 'desc';

export type PatientStatusFilter = 'all' | 'active' | 'inactive';
export const PATIENT_STATUS_FILTER_VALUES: readonly PatientStatusFilter[] = [
  'all',
  'active',
  'inactive',
];

export type PatientSexFilter = 'all' | 'male' | 'female' | 'other';
export const PATIENT_SEX_FILTER_VALUES: readonly PatientSexFilter[] = [
  'all',
  'male',
  'female',
  'other',
];

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
  readonly limit: number;
}
