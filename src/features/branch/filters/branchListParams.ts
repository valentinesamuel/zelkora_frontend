// URL-backed list state for the Branches page (D7 Option C).
//
// Mirrors the SHAPE of `src/features/patients/filters/patientListParams.ts` — a
// `KEY` map, `oneOf` coercion, defaults omitted from the serialised output —
// but carries only the keys D7 calls for: search / status / sort / dir /
// pageSize, plus the offset `page`. Patients paginate by cursor/infinite and
// never put a page number in the URL; branches page by offset (D7), so `page`
// is part of the shareable state.

export type BranchSortField = 'name' | 'code';
export type BranchSortDir = 'asc' | 'desc';
export type BranchStatusFilter = 'all' | 'active' | 'inactive';

export interface BranchListQuery {
  readonly search: string;
  readonly status: BranchStatusFilter;
  readonly sortField: BranchSortField;
  readonly sortDir: BranchSortDir;
  readonly pageSize: number;
  readonly page: number;
}

export const DEFAULT_LIMIT = 25;

export const LIMIT_OPTIONS = [10, 25, 50] as const;

// Mirrors `MAX_PAGE_TIMES_PAGE_SIZE` in `src/lib/query/builder.ts`:
// `QueryBuilder.build()` throws `QueryValidationError` once `page * pageSize`
// exceeds this, and `useBranches` calls `.build()` during render — an
// unbounded `?page=` from the URL would crash the page. `page` is clamped here
// so `build()` never throws on pagination.
const MAX_PAGE_TIMES_PAGE_SIZE = 10_000;

const STATUS_ALL: BranchStatusFilter = 'all';

const STATUS_VALUES: readonly BranchStatusFilter[] = [
  'all',
  'active',
  'inactive',
];
const SORT_FIELDS: readonly BranchSortField[] = ['name', 'code'];
const SORT_DIRS: readonly BranchSortDir[] = ['asc', 'desc'];

export const DEFAULT_BRANCH_LIST_QUERY: BranchListQuery = {
  search: '',
  status: STATUS_ALL,
  sortField: 'name',
  sortDir: 'asc',
  pageSize: DEFAULT_LIMIT,
  page: 1,
};

// URL keys — short, stable, shareable. Same spellings as `patientListParams`.
const KEY = {
  search: 'q',
  status: 'status',
  sortField: 'sort',
  sortDir: 'dir',
  pageSize: 'limit',
  page: 'page',
} as const;

function oneOf<T extends string>(
  raw: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return raw !== null && (allowed as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback;
}

export function coerceBranchStatusFilter(
  raw: string,
  fallback: BranchStatusFilter,
): BranchStatusFilter {
  return oneOf(raw, STATUS_VALUES, fallback);
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

export function parseBranchListParams(sp: URLSearchParams): BranchListQuery {
  const pageSize = toPageSize(sp.get(KEY.pageSize));

  return {
    search: sp.get(KEY.search)?.trim() ?? '',
    status: oneOf(sp.get(KEY.status), STATUS_VALUES, STATUS_ALL),
    sortField: oneOf(sp.get(KEY.sortField), SORT_FIELDS, 'name'),
    sortDir: oneOf(sp.get(KEY.sortDir), SORT_DIRS, 'asc'),
    pageSize,
    page: toPage(sp.get(KEY.page), pageSize),
  };
}

export function serializeBranchListParams(
  query: BranchListQuery,
): Record<string, string> {
  const out: Record<string, string> = {};
  const d = DEFAULT_BRANCH_LIST_QUERY;

  if (query.search !== d.search) out[KEY.search] = query.search;
  if (query.status !== d.status) out[KEY.status] = query.status;
  if (query.sortField !== d.sortField) out[KEY.sortField] = query.sortField;
  if (query.sortDir !== d.sortDir) out[KEY.sortDir] = query.sortDir;
  if (query.pageSize !== d.pageSize) out[KEY.pageSize] = String(query.pageSize);
  if (query.page !== d.page) out[KEY.page] = String(query.page);

  return out;
}

export function countActiveFilters(query: BranchListQuery): number {
  let n = 0;
  if (query.status !== STATUS_ALL) n += 1;
  return n;
}

export function hasActiveQuery(query: BranchListQuery): boolean {
  return query.search.trim() !== '' || countActiveFilters(query) > 0;
}

export function clearBranchFilters(query: BranchListQuery): BranchListQuery {
  return { ...query, status: STATUS_ALL, page: 1 };
}
