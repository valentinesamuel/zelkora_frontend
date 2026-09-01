import {
  PATIENT_SEX_FILTER_VALUES,
  PATIENT_STATUS_FILTER_VALUES,
} from '@/features/patients/types/patientListQuery.types';
import type {
  PatientListQuery,
  PatientSexFilter,
  PatientSortField,
  PatientStatusFilter,
  SortDir,
} from '@/features/patients/types/patientListQuery.types';

export const DEFAULT_LIMIT = 25;

export const LIMIT_OPTIONS = [10, 25, 50] as const;

const STATUS_VALUES: readonly PatientStatusFilter[] =
  PATIENT_STATUS_FILTER_VALUES;
const SEX_VALUES: readonly PatientSexFilter[] = PATIENT_SEX_FILTER_VALUES;
const SORT_FIELDS: readonly PatientSortField[] = [
  'name',
  'age',
  'registeredAt',
];
const SORT_DIRS: readonly SortDir[] = ['asc', 'desc'];

export const DEFAULT_PATIENT_LIST_QUERY: PatientListQuery = {
  search: '',
  status: 'all',
  sex: 'all',
  ageMin: null,
  ageMax: null,
  registeredFrom: null,
  registeredTo: null,
  sortField: 'name',
  sortDir: 'asc',
  limit: DEFAULT_LIMIT,
};

// URL keys — short, stable, shareable.
const KEY = {
  search: 'q',
  status: 'status',
  sex: 'sex',
  ageMin: 'ageMin',
  ageMax: 'ageMax',
  registeredFrom: 'from',
  registeredTo: 'to',
  sortField: 'sort',
  sortDir: 'dir',
  limit: 'limit',
} as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function oneOf<T extends string>(
  raw: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return raw !== null && (allowed as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback;
}

export function coerceStatusFilter(
  raw: string,
  fallback: PatientStatusFilter,
): PatientStatusFilter {
  return oneOf(raw, STATUS_VALUES, fallback);
}

export function coerceSexFilter(
  raw: string,
  fallback: PatientSexFilter,
): PatientSexFilter {
  return oneOf(raw, SEX_VALUES, fallback);
}

function toAge(raw: string | null): number | null {
  if (raw === null) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 150) return null;
  return n;
}

function toIsoDate(raw: string | null): string | null {
  if (raw === null || !ISO_DATE.test(raw)) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : raw;
}

export function parsePatientListParams(sp: URLSearchParams): PatientListQuery {
  let ageMin = toAge(sp.get(KEY.ageMin));
  let ageMax = toAge(sp.get(KEY.ageMax));
  if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
    [ageMin, ageMax] = [ageMax, ageMin];
  }

  let registeredFrom = toIsoDate(sp.get(KEY.registeredFrom));
  let registeredTo = toIsoDate(sp.get(KEY.registeredTo));
  if (
    registeredFrom !== null &&
    registeredTo !== null &&
    registeredFrom > registeredTo
  ) {
    [registeredFrom, registeredTo] = [registeredTo, registeredFrom];
  }

  const rawLimit = Number(sp.get(KEY.limit));
  const limit = (LIMIT_OPTIONS as readonly number[]).includes(rawLimit)
    ? rawLimit
    : DEFAULT_LIMIT;

  return {
    search: sp.get(KEY.search)?.trim() ?? '',
    status: oneOf(sp.get(KEY.status), STATUS_VALUES, 'all'),
    sex: oneOf(sp.get(KEY.sex), SEX_VALUES, 'all'),
    ageMin,
    ageMax,
    registeredFrom,
    registeredTo,
    sortField: oneOf(sp.get(KEY.sortField), SORT_FIELDS, 'name'),
    sortDir: oneOf(sp.get(KEY.sortDir), SORT_DIRS, 'asc'),
    limit,
  };
}

export function serializePatientListParams(
  query: PatientListQuery,
): Record<string, string> {
  const out: Record<string, string> = {};
  const d = DEFAULT_PATIENT_LIST_QUERY;

  if (query.search !== d.search) out[KEY.search] = query.search;
  if (query.status !== d.status) out[KEY.status] = query.status;
  if (query.sex !== d.sex) out[KEY.sex] = query.sex;
  if (query.ageMin !== null) out[KEY.ageMin] = String(query.ageMin);
  if (query.ageMax !== null) out[KEY.ageMax] = String(query.ageMax);
  if (query.registeredFrom !== null)
    out[KEY.registeredFrom] = query.registeredFrom;
  if (query.registeredTo !== null) out[KEY.registeredTo] = query.registeredTo;
  if (query.sortField !== d.sortField) out[KEY.sortField] = query.sortField;
  if (query.sortDir !== d.sortDir) out[KEY.sortDir] = query.sortDir;
  if (query.limit !== d.limit) out[KEY.limit] = String(query.limit);

  return out;
}

export function countActiveFilters(query: PatientListQuery): number {
  let n = 0;
  if (query.status !== 'all') n += 1;
  if (query.sex !== 'all') n += 1;
  if (query.ageMin !== null || query.ageMax !== null) n += 1;
  if (query.registeredFrom !== null || query.registeredTo !== null) n += 1;
  return n;
}

export function hasActiveQuery(query: PatientListQuery): boolean {
  return query.search.trim() !== '' || countActiveFilters(query) > 0;
}

export function clearFilters(query: PatientListQuery): PatientListQuery {
  return {
    ...query,
    status: 'all',
    sex: 'all',
    ageMin: null,
    ageMax: null,
    registeredFrom: null,
    registeredTo: null,
  };
}
