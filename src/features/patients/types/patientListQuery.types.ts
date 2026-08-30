import type { Patient } from '@/features/patients/types/patient.types';

export type PatientSortField = 'name' | 'age' | 'registeredAt';
export type SortDir = 'asc' | 'desc';

export enum PatientStatusFilterEnum {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
}

export enum PatientSexFilterEnum {
  ALL = 'all',
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export type PatientStatusFilter = PatientStatusFilterEnum;
export type PatientSexFilter = PatientSexFilterEnum;

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
  readonly total: number | null;
}
