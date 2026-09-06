// HTTP access for the Staff entity, built on top of the query
// builder/serializer. A plain object of functions — the builder already owns
// validation (`QueryBuilder.build()` throws `QueryValidationError`), so the
// repository only does the HTTP call + response reshaping.
//
// DUPLICATION NOTE (OQ-6 / Phase 10 follow-up): `RawCursorPage` /
// `RawOffsetPage` / `toPaginatedResult` / `buildListPath` are copied verbatim
// from `branchesRepository.ts` (itself copied from `patientsRepository.ts`).
// They are NOT extracted into `src/lib/query/` here — mid-feature refactors of
// the sibling repositories are out of scope. Extraction is proposed as a
// Phase 10 follow-up.

import { apiRequest } from '@/lib/apiClient';
import { toQueryString } from '@/lib/query';
import type { PaginatedResult, PaginationMode, QueryState } from '@/lib/query';

import { staffQueryMeta } from '@/features/staff/api/staff.queryMeta';
import { staffMeSchema } from '@/features/staff/schemas/staffMe.schema';
import type {
  Department,
  Role,
  StaffListItem,
  StaffMe,
} from '@/features/staff/types/staff.types';

// ---------------------------------------------------------------------------
// Wire shapes (`result` payload of the `GET /staff` envelope).
//
// `nextCursor` / `total` are Go pointers with `json:",omitempty"` — the backend
// OMITS the key entirely when absent, never sends an explicit `null`. Both wire
// forms are normalised to `| null` in `toPaginatedResult`.
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
// (`state.pagination.mode`), not by sniffing which fields happen to be present
// on the response — that is the only reliable discriminant the client has, and
// it is always known before the request is even sent.
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
  const qs = toQueryString(state, staffQueryMeta.entity);
  return qs.length > 0 ? `/staff?${qs}` : '/staff';
}

async function list(state: QueryState): Promise<PaginatedResult<StaffListItem>> {
  const raw = await apiRequest<RawQueryPage<StaffListItem>>(
    buildListPath(state),
  );
  return toPaginatedResult(state.pagination.mode, raw);
}

function get(id: string): Promise<StaffListItem> {
  return apiRequest<StaffListItem>(`/staff/${id}`);
}

async function me(): Promise<StaffMe> {
  return staffMeSchema.parse(await apiRequest<unknown>('/staff/me'));
}

// The backend sends more columns than `Department` picks (id/name/branchId);
// extra keys are ignored at runtime. Not a strict trust boundary — no zod.
function departments(): Promise<Department[]> {
  return apiRequest<Department[]>('/staff/departments');
}

function roles(): Promise<Role[]> {
  return apiRequest<Role[]>('/auth/roles');
}

export const staffRepository = { list, get, me, departments, roles };
