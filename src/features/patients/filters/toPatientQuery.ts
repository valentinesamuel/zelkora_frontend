// The single translation seam between the URL-backed list UI state
// (`PatientListQuery`) and the backend query contract (a Patient
// `QueryBuilder`). Pure: no I/O, no React, no `new Date()` — `now` is injected
// so every age boundary is deterministically testable.
//
// Deliberately absent:
//   - `.cursor(...)`  — the cursor never lives in UI state (R-OQ3 / INV-U1);
//                       `usePatientsInfinite` owns the pagination position and
//                       re-applies `.cursor()` onto this builder per page.
//   - `filter[branchId]` — force-overwritten server-side from the JWT (INV-B1).
//   - a trailing `id` sort — the backend always appends `id ASC` (INV-Q8).

import { patientQuery } from '@/features/patients/api/patient.queryMeta';
import type { PatientQueryBuilder } from '@/features/patients/api/patients.api';
import { PATIENT_LIST_FIELDS } from '@/features/patients/components/patientColumns';
import type {
  PatientListQuery,
  PatientSortField,
  SortDir,
} from '@/features/patients/types/patientListQuery.types';

const FIELD_DATE_OF_BIRTH = 'dateOfBirth';
const FIELD_CREATED_AT = 'createdAt';
const OP_GTE = 'gte';
const OP_LTE = 'lte';

const MAX_SEARCH_TERM_LENGTH = 200;

const DAYS_PER_STEP = 1;

function toIsoDate(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function minusYears(now: Date, years: number): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth(), now.getUTCDate()),
  );
}

function plusDays(date: Date, days: number): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );
}

export function dobLowerBoundForMaxAge(ageMax: number, now: Date): string {
  return toIsoDate(plusDays(minusYears(now, ageMax + 1), DAYS_PER_STEP));
}

export function dobUpperBoundForMinAge(ageMin: number, now: Date): string {
  return toIsoDate(minusYears(now, ageMin));
}

function invert(dir: SortDir): SortDir {
  if (dir === 'asc') return 'desc';
  return 'asc';
}

function applySort(
  builder: PatientQueryBuilder,
  field: PatientSortField,
  dir: SortDir,
): PatientQueryBuilder {
  if (field === 'name') {
    return builder.sort('firstName', dir);
  }
  if (field === 'age') {
    return builder.sort(FIELD_DATE_OF_BIRTH, invert(dir));
  }
  return builder.sort(FIELD_CREATED_AT, dir);
}

function applySearch(
  builder: PatientQueryBuilder,
  rawSearch: string,
): PatientQueryBuilder {
  const term = rawSearch.trim().slice(0, MAX_SEARCH_TERM_LENGTH);
  if (term === '') return builder;
  // AllowedSearch is exactly [firstName, lastName]; the backend ORs the two.
  return builder
    .search('firstName', 'ilike', term)
    .search('lastName', 'ilike', term);
}

function applyStatus(
  builder: PatientQueryBuilder,
  status: PatientListQuery['status'],
): PatientQueryBuilder {
  if (status === 'active') return builder.where('isActive', 'eq', true);
  if (status === 'inactive') return builder.where('isActive', 'eq', false);
  return builder;
}

function applySex(
  builder: PatientQueryBuilder,
  sex: PatientListQuery['sex'],
): PatientQueryBuilder {
  if (sex === 'all') return builder;
  return builder.where('gender', 'eq', sex);
}

function applyAge(
  builder: PatientQueryBuilder,
  ageMin: number | null,
  ageMax: number | null,
  now: Date,
): PatientQueryBuilder {
  if (ageMin !== null && ageMax !== null) {
    return builder.whereBetween(FIELD_DATE_OF_BIRTH, [
      dobLowerBoundForMaxAge(ageMax, now),
      dobUpperBoundForMinAge(ageMin, now),
    ]);
  }
  if (ageMax !== null) {
    return builder.where(
      FIELD_DATE_OF_BIRTH,
      OP_GTE,
      dobLowerBoundForMaxAge(ageMax, now),
    );
  }
  if (ageMin !== null) {
    return builder.where(
      FIELD_DATE_OF_BIRTH,
      OP_LTE,
      dobUpperBoundForMinAge(ageMin, now),
    );
  }
  return builder;
}

function applyRegistered(
  builder: PatientQueryBuilder,
  from: string | null,
  to: string | null,
): PatientQueryBuilder {
  if (from !== null && to !== null) {
    return builder.whereBetween(FIELD_CREATED_AT, [from, to]);
  }
  if (from !== null) return builder.where(FIELD_CREATED_AT, OP_GTE, from);
  if (to !== null) return builder.where(FIELD_CREATED_AT, OP_LTE, to);
  return builder;
}

export function toPatientQuery(
  ui: PatientListQuery,
  now: Date,
): PatientQueryBuilder<(typeof PATIENT_LIST_FIELDS)[number]> {
  let builder = patientQuery();

  builder = applySearch(builder, ui.search);
  builder = applyStatus(builder, ui.status);
  builder = applySex(builder, ui.sex);
  builder = applyAge(builder, ui.ageMin, ui.ageMax, now);
  builder = applyRegistered(builder, ui.registeredFrom, ui.registeredTo);
  builder = applySort(builder, ui.sortField, ui.sortDir);

  return builder.limit(ui.limit).select(...PATIENT_LIST_FIELDS);
}
