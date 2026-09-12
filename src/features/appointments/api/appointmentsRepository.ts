// HTTP access for the Appointment entity, built on top of the query
// builder/serializer. A plain object of functions — the builder already owns
// validation (`QueryBuilder.build()` throws `QueryValidationError`), so there
// is nothing for a repository "layer" to add beyond the HTTP call + response
// reshaping done below.
//
// DUPLICATION NOTE (OQ-6): `RawCursorPage` / `RawOffsetPage` /
// `toPaginatedResult` are copied verbatim from `branchesRepository.ts` (which
// copied them from `patientsRepository.ts`, as did `staffRepository.ts`). They
// are deliberately NOT extracted into `src/lib/query/` here — extracting mid-
// feature would touch three other features' repositories. Extraction remains a
// standing follow-up.

import { apiRequest } from '@/lib/apiClient';
import { toQueryString } from '@/lib/query';
import type { PaginatedResult, PaginationMode, QueryState } from '@/lib/query';

import { appointmentQueryMeta } from '@/features/appointments/api/appointment.queryMeta';
import type {
  Appointment,
  CreateAppointmentBody,
  UpdateAppointmentBody,
} from '@/features/appointments/types/appointment.types';

// ---------------------------------------------------------------------------
// Wire shapes (`result` payload of the `GET /appointments` envelope).
//
// `nextCursor` / `total` are Go pointers with `json:",omitempty"` — the
// backend OMITS the key entirely when absent, never sends an explicit
// `null`. Both wire forms are normalised to `| null` in `toPaginatedResult`.
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
  const qs = toQueryString(state, appointmentQueryMeta.entity);
  return qs.length > 0 ? `/appointments?${qs}` : '/appointments';
}

async function list<T = Appointment>(
  state: QueryState,
): Promise<PaginatedResult<T>> {
  const raw = await apiRequest<RawQueryPage<T>>(buildListPath(state));
  return toPaginatedResult<T>(state.pagination.mode, raw);
}

function get(id: string): Promise<Appointment> {
  return apiRequest<Appointment>(`/appointments/${id}`);
}

function create(body: CreateAppointmentBody): Promise<Appointment> {
  return apiRequest<Appointment>('/appointments', { method: 'POST', body });
}

function update(id: string, body: UpdateAppointmentBody): Promise<Appointment> {
  return apiRequest<Appointment>(`/appointments/${id}`, {
    method: 'PATCH',
    body,
  });
}

// `DELETE /appointments/:id` is a SOFT delete (sets `deletedAt`) and responds
// with `result: null`.
async function remove(id: string): Promise<void> {
  await apiRequest<null>(`/appointments/${id}`, { method: 'DELETE' });
}

export const appointmentsRepository = { list, get, create, update, remove };
