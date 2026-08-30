// Pure serde between the URL query string and `PatientListQuery`. NO I/O and no
// React — `usePatientListParams` is the only module that touches
// `useSearchParams`. Mirrors the `filtersPersistence.ts` pattern from the
// dashboard: read + heal, and write only what differs from the default so a
// pristine list is just `/patients`.

import type {
  PatientListQuery,
  PatientSexFilter,
  PatientSortField,
  PatientStatusFilter,
  SortDir,
} from '@/features/patients/types/patientListQuery.types';

export const DEFAULT_LIMIT = 25;
export const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

const STATUS_VALUES: readonly PatientStatusFilter[] = [
  'all',
  'active',
  'inactive',
  'deceased',
];
const SEX_VALUES: readonly PatientSexFilter[] = [
  'all',
  'male',
  'female',
  'other',
];
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
  cursor: null,
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
  cursor: 'cursor',
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

/** Read a validated, fully-resolved query from a `URLSearchParams`. Never throws. */
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

  const rawCursor = sp.get(KEY.cursor);

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
    cursor: rawCursor !== null && rawCursor !== '' ? rawCursor : null,
    limit,
  };
}

/** Serialise to a flat record, omitting anything still at its default. */
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
  if (query.cursor !== null) out[KEY.cursor] = query.cursor;

  return out;
}

/**
 * Count of applied FILTERS for the "Filters (n)" badge. Search and sort are
 * their own controls and are deliberately excluded. An age or registered-date
 * range counts once, however many bounds are set.
 */
export function countActiveFilters(query: PatientListQuery): number {
  let n = 0;
  if (query.status !== 'all') n += 1;
  if (query.sex !== 'all') n += 1;
  if (query.ageMin !== null || query.ageMax !== null) n += 1;
  if (query.registeredFrom !== null || query.registeredTo !== null) n += 1;
  return n;
}

/** True when search or any filter is applied (drives the "no results" empty state). */
export function hasActiveQuery(query: PatientListQuery): boolean {
  return query.search.trim() !== '' || countActiveFilters(query) > 0;
}

/** Drop the cursor — call whenever search / filters / sort / limit change. */
export function resetCursor(query: PatientListQuery): PatientListQuery {
  return query.cursor === null ? query : { ...query, cursor: null };
}

/** Reset every filter (keeps search, sort, limit). */
export function clearFilters(query: PatientListQuery): PatientListQuery {
  return {
    ...query,
    status: 'all',
    sex: 'all',
    ageMin: null,
    ageMax: null,
    registeredFrom: null,
    registeredTo: null,
    cursor: null,
  };
}
