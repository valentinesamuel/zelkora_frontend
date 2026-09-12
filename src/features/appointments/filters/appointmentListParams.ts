// URL-backed list state for the Appointments page.
//
// Mirrors the SHAPE of `src/features/branch/filters/branchListParams.ts` — a
// `KEY` map, `oneOf` coercion, defaults omitted from the serialised output,
// and an offset `page` in the URL. Branch, not Patients, is the precedent:
// appointments page by OFFSET (page numbers), so the page number is part of
// the shareable state rather than a cursor the UI owns privately.
//
// There is no `search` key: `appointmentQueryMeta.searchFields` is empty
// (AllowedSearch is nil server-side), so a free-text box would have nothing to
// send. Narrowing happens through the patient/staff/status/type/date filters.

import {
  APPOINTMENT_STATUS_VALUES,
  APPOINTMENT_TYPE_VALUES,
} from '@/features/appointments/types/appointment.types';
import type {
  AppointmentStatus,
  AppointmentType,
} from '@/features/appointments/types/appointment.types';

export type AppointmentSortField = 'startAt' | 'createdAt' | 'status';
export type AppointmentSortDir = 'asc' | 'desc';
export type AppointmentStatusFilter = 'all' | AppointmentStatus;
export type AppointmentTypeFilter = 'all' | AppointmentType;

export interface AppointmentListQuery {
  readonly status: AppointmentStatusFilter;
  readonly type: AppointmentTypeFilter;
  readonly patientId: string | null;
  readonly staffId: string | null;
  /** Inclusive lower bound on `startAt`, as a `YYYY-MM-DD` calendar date. */
  readonly startFrom: string | null;
  /** Inclusive upper bound on `startAt`, as a `YYYY-MM-DD` calendar date. */
  readonly startTo: string | null;
  readonly sortField: AppointmentSortField;
  readonly sortDir: AppointmentSortDir;
  readonly pageSize: number;
  readonly page: number;
}

export const DEFAULT_LIMIT = 25;

export const LIMIT_OPTIONS = [10, 25, 50] as const;

// Mirrors `MAX_PAGE_TIMES_PAGE_SIZE` in `src/lib/query/builder.ts`:
// `QueryBuilder.build()` throws `QueryValidationError` once `page * pageSize`
// exceeds this, and `useAppointments` calls `.build()` during render — an
// unbounded `?page=` from the URL would crash the page. `page` is clamped here
// so `build()` never throws on pagination.
const MAX_PAGE_TIMES_PAGE_SIZE = 10_000;

const FILTER_ALL = 'all';

const STATUS_VALUES: readonly AppointmentStatusFilter[] = [
  FILTER_ALL,
  ...APPOINTMENT_STATUS_VALUES,
];
const TYPE_VALUES: readonly AppointmentTypeFilter[] = [
  FILTER_ALL,
  ...APPOINTMENT_TYPE_VALUES,
];
const SORT_FIELDS: readonly AppointmentSortField[] = [
  'startAt',
  'createdAt',
  'status',
];
const SORT_DIRS: readonly AppointmentSortDir[] = ['asc', 'desc'];

export const DEFAULT_APPOINTMENT_LIST_QUERY: AppointmentListQuery = {
  status: FILTER_ALL,
  type: FILTER_ALL,
  patientId: null,
  staffId: null,
  startFrom: null,
  startTo: null,
  sortField: 'startAt',
  sortDir: 'asc',
  pageSize: DEFAULT_LIMIT,
  page: 1,
};

// URL keys — short, stable, shareable. `limit`/`page`/`sort`/`dir` keep the
// spellings `patientListParams` and `branchListParams` already use.
const KEY = {
  status: 'status',
  type: 'type',
  patientId: 'patientId',
  staffId: 'staffId',
  startFrom: 'startFrom',
  startTo: 'startTo',
  sortField: 'sort',
  sortDir: 'dir',
  pageSize: 'limit',
  page: 'page',
} as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function oneOf<T extends string>(
  raw: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return raw !== null && (allowed as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback;
}

export function coerceAppointmentStatusFilter(
  raw: string,
  fallback: AppointmentStatusFilter,
): AppointmentStatusFilter {
  return oneOf(raw, STATUS_VALUES, fallback);
}

export function coerceAppointmentTypeFilter(
  raw: string,
  fallback: AppointmentTypeFilter,
): AppointmentTypeFilter {
  return oneOf(raw, TYPE_VALUES, fallback);
}

// A non-uuid `?patientId=` would be rejected by the builder's uuid field
// validation, so it is healed away here rather than allowed to throw.
function toUuid(raw: string | null): string | null {
  if (raw === null || !UUID.test(raw)) return null;
  return raw;
}

function toIsoDate(raw: string | null): string | null {
  if (raw === null || !ISO_DATE.test(raw)) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : raw;
}

function toPageSize(raw: string | null): number {
  const n = Number(raw);
  return (LIMIT_OPTIONS as readonly number[]).includes(n) ? n : DEFAULT_LIMIT;
}

function toPage(raw: string | null, pageSize: number): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return 1;
  const maxPage = Math.floor(MAX_PAGE_TIMES_PAGE_SIZE / pageSize);
  return Math.min(n, maxPage);
}

export function parseAppointmentListParams(
  sp: URLSearchParams,
): AppointmentListQuery {
  const pageSize = toPageSize(sp.get(KEY.pageSize));

  let startFrom = toIsoDate(sp.get(KEY.startFrom));
  let startTo = toIsoDate(sp.get(KEY.startTo));
  if (startFrom !== null && startTo !== null && startFrom > startTo) {
    [startFrom, startTo] = [startTo, startFrom];
  }

  return {
    status: oneOf(sp.get(KEY.status), STATUS_VALUES, FILTER_ALL),
    type: oneOf(sp.get(KEY.type), TYPE_VALUES, FILTER_ALL),
    patientId: toUuid(sp.get(KEY.patientId)),
    staffId: toUuid(sp.get(KEY.staffId)),
    startFrom,
    startTo,
    sortField: oneOf(sp.get(KEY.sortField), SORT_FIELDS, 'startAt'),
    sortDir: oneOf(sp.get(KEY.sortDir), SORT_DIRS, 'asc'),
    pageSize,
    page: toPage(sp.get(KEY.page), pageSize),
  };
}

export function serializeAppointmentListParams(
  query: AppointmentListQuery,
): Record<string, string> {
  const out: Record<string, string> = {};
  const d = DEFAULT_APPOINTMENT_LIST_QUERY;

  if (query.status !== d.status) out[KEY.status] = query.status;
  if (query.type !== d.type) out[KEY.type] = query.type;
  if (query.patientId !== null) out[KEY.patientId] = query.patientId;
  if (query.staffId !== null) out[KEY.staffId] = query.staffId;
  if (query.startFrom !== null) out[KEY.startFrom] = query.startFrom;
  if (query.startTo !== null) out[KEY.startTo] = query.startTo;
  if (query.sortField !== d.sortField) out[KEY.sortField] = query.sortField;
  if (query.sortDir !== d.sortDir) out[KEY.sortDir] = query.sortDir;
  if (query.pageSize !== d.pageSize) out[KEY.pageSize] = String(query.pageSize);
  if (query.page !== d.page) out[KEY.page] = String(query.page);

  return out;
}

export function countActiveFilters(query: AppointmentListQuery): number {
  let n = 0;
  if (query.status !== FILTER_ALL) n += 1;
  if (query.type !== FILTER_ALL) n += 1;
  if (query.patientId !== null) n += 1;
  if (query.staffId !== null) n += 1;
  if (query.startFrom !== null || query.startTo !== null) n += 1;
  return n;
}

export function hasActiveQuery(query: AppointmentListQuery): boolean {
  return countActiveFilters(query) > 0;
}

export function clearAppointmentFilters(
  query: AppointmentListQuery,
): AppointmentListQuery {
  return {
    ...query,
    status: FILTER_ALL,
    type: FILTER_ALL,
    patientId: null,
    staffId: null,
    startFrom: null,
    startTo: null,
    page: 1,
  };
}
