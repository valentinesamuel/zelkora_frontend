// HTTP access for the Branch entity, built on top of the query
// builder/serializer. A plain object of two functions — the builder already
// owns validation (`QueryBuilder.build()` throws `QueryValidationError`), so
// there is nothing for a repository "layer" to add beyond the HTTP call +
// response reshaping done below.
//
// DUPLICATION NOTE (OQ-6 / Phase 10 follow-up): `RawCursorPage` /
// `RawOffsetPage` / `toPaginatedResult` are copied verbatim from
// `patientsRepository.ts`. They are NOT extracted into `src/lib/query/` here —
// `patientsRepository.ts` must not be refactored mid-feature. Extraction is
// proposed as a Phase 10 follow-up.

import { apiRequest } from '@/lib/apiClient';
import { toQueryString } from '@/lib/query';
import type { PaginatedResult, PaginationMode, QueryState } from '@/lib/query';

import { branchQueryMeta } from '@/features/branch/api/branch.queryMeta';
import type { Branch } from '@/features/branch/types/branch.types';

// ---------------------------------------------------------------------------
// Wire shapes (`result` payload of the `GET /branches` envelope).
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
  const qs = toQueryString(state, branchQueryMeta.entity);
  return qs.length > 0 ? `/branches?${qs}` : '/branches';
}

async function list<T = Branch>(
  state: QueryState,
): Promise<PaginatedResult<T>> {
  const raw = await apiRequest<RawQueryPage<T>>(buildListPath(state));
  return toPaginatedResult<T>(state.pagination.mode, raw);
}

function get(id: string): Promise<Branch> {
  return apiRequest<Branch>(`/branches/${id}`);
}

export const branchesRepository = { list, get };
