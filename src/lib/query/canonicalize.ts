import type {
  FilterClause,
  FilterValue,
  PaginationState,
  QueryState,
  SearchClause,
  SortClause,
} from './types';

type JsonSafeFilterValue = string | boolean | null | readonly string[];

export interface CanonicalFilter {
  readonly field: string;
  readonly op: string;
  readonly value: JsonSafeFilterValue;
}

export interface CanonicalSearch {
  readonly field: string;
  readonly mode: string;
  readonly term: string;
}

export interface CanonicalSort {
  readonly field: string;
  readonly direction: string;
}

export interface CanonicalPagination {
  readonly mode: string;
  readonly limit?: number;
  readonly cursor?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface CanonicalQuery {
  readonly filters: readonly CanonicalFilter[];
  readonly searches: readonly CanonicalSearch[];
  readonly sort: readonly CanonicalSort[];
  readonly includes: readonly string[];
  readonly select: readonly string[];
  readonly pagination: CanonicalPagination;
  readonly withTotal: boolean;
  readonly withDeleted: boolean;
}

function toJsonSafeFilterValue(value: FilterValue): JsonSafeFilterValue {
  return value ?? null;
}

function filterSortKey(clause: FilterClause): string {
  return JSON.stringify([
    clause.field,
    clause.op,
    toJsonSafeFilterValue(clause.value),
  ]);
}

function searchSortKey(clause: SearchClause): string {
  return JSON.stringify([clause.field, clause.mode, clause.term]);
}

function canonicalizeFilters(
  filters: readonly FilterClause[],
): readonly CanonicalFilter[] {
  return [...filters]
    .sort((a, b) => filterSortKey(a).localeCompare(filterSortKey(b)))
    .map((clause) => ({
      field: clause.field,
      op: clause.op,
      value: toJsonSafeFilterValue(clause.value),
    }));
}

function canonicalizeSearches(
  searches: readonly SearchClause[],
): readonly CanonicalSearch[] {
  return [...searches]
    .sort((a, b) => searchSortKey(a).localeCompare(searchSortKey(b)))
    .map((clause) => ({
      field: clause.field,
      mode: clause.mode,
      term: clause.term,
    }));
}

function canonicalizeSort(
  sort: readonly SortClause[],
): readonly CanonicalSort[] {
  // Order preserved intentionally.
  return sort.map((clause) => ({
    field: clause.field,
    direction: clause.direction,
  }));
}

function canonicalizePagination(
  pagination: PaginationState,
  excludeCursor: boolean,
): CanonicalPagination {
  const result: CanonicalPagination = { mode: pagination.mode };
  const withLimit =
    pagination.limit !== undefined
      ? { ...result, limit: pagination.limit }
      : result;
  const withCursor =
    !excludeCursor && pagination.cursor !== undefined
      ? { ...withLimit, cursor: pagination.cursor }
      : withLimit;
  const withPage =
    pagination.page !== undefined
      ? { ...withCursor, page: pagination.page }
      : withCursor;
  return pagination.pageSize !== undefined
    ? { ...withPage, pageSize: pagination.pageSize }
    : withPage;
}

function canonicalize(
  state: QueryState,
  options: { excludeCursor: boolean; excludeWithTotal: boolean },
): CanonicalQuery {
  return {
    filters: canonicalizeFilters(state.filters),
    searches: canonicalizeSearches(state.searches),
    sort: canonicalizeSort(state.sort),
    includes: [...state.includes].sort((a, b) => a.localeCompare(b)),
    select: [...state.select].sort((a, b) => a.localeCompare(b)),
    pagination: canonicalizePagination(state.pagination, options.excludeCursor),
    withTotal: options.excludeWithTotal ? false : state.withTotal,
    withDeleted: state.withDeleted,
  };
}

export function canonicalizeQuery(state: QueryState): CanonicalQuery {
  return canonicalize(state, { excludeCursor: false, excludeWithTotal: false });
}

export function canonicalizeForKey(state: QueryState): CanonicalQuery {
  return canonicalize(state, { excludeCursor: true, excludeWithTotal: true });
}
