// HTTP access for the Patient entity, built on top of the Phase-1 query
// builder/serializer. There is no `PatientsRepository` interface / class
// indirection here (see phase-4 report) — a plain object of two functions is
// all the current call sites need, and the builder already owns validation
// (`QueryBuilder.build()` throws `QueryValidationError`) so there is nothing
// left for a repository "layer" to add beyond the HTTP call + response
// reshaping done below.

import { apiRequest } from '@/lib/apiClient';
import { toQueryString } from '@/lib/query';
import type { PaginatedResult, PaginationMode, QueryState } from '@/lib/query';

import { patientQueryMeta } from '@/features/patients/api/patient.queryMeta';
import type { Patient } from '@/features/patients/types/patient.types';

// ---------------------------------------------------------------------------
// Wire shapes (`result` payload of the `GET /patients` envelope).
//
// `nextCursor` / `total` are Go pointers with `json:",omitempty"` — the
// backend OMITS the key entirely when absent, never sends an explicit
// `null`. Both wire forms (absent key, explicit `null`) are normalised to
// `| null` in `toPaginatedResult`, the one place that happens.
// ---------------------------------------------------------------------------

interface RawCursorPage<T> {
  readonly data: readonly T[];
  readonly nextCursor?: string | null;
  readonly total?: number;
}

interface RawOffsetPage<T> {
  readonly data: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

type RawQueryPage<T> = RawCursorPage<T> | RawOffsetPage<T>;

// The response shape is driven by which pagination mode the REQUEST used
// (`state.pagination.mode`), not by sniffing which fields happen to be
// present on the response — that is the only reliable discriminant the
// client has, and it is always known before the request is even sent.
function toPaginatedResult<T>(
  mode: PaginationMode,
  raw: RawQueryPage<T>,
): PaginatedResult<T> {
  if (mode === 'offset') {
    const offsetRaw = raw as RawOffsetPage<T>;
    return {
      mode: 'offset',
      data: offsetRaw.data,
      page: offsetRaw.page,
      pageSize: offsetRaw.pageSize,
      total: offsetRaw.total,
    };
  }
  const cursorRaw = raw as RawCursorPage<T>;
  return {
    mode: 'cursor',
    data: cursorRaw.data,
    nextCursor: cursorRaw.nextCursor ?? null,
    total: cursorRaw.total,
  };
}

function buildListPath(state: QueryState): string {
  const qs = toQueryString(state, patientQueryMeta.entity);
  return qs.length > 0 ? `/patients?${qs}` : '/patients';
}

async function list<T = Patient>(
  state: QueryState,
): Promise<PaginatedResult<T>> {
  const raw = await apiRequest<RawQueryPage<T>>(buildListPath(state));
  return toPaginatedResult<T>(state.pagination.mode, raw);
}

function get(id: string): Promise<Patient> {
  return apiRequest<Patient>(`/patients/${id}`);
}

export const patientsRepository = { list, get };
