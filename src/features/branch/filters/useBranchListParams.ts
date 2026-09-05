import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  clearBranchFilters as clearBranchFiltersPure,
  parseBranchListParams,
  serializeBranchListParams,
} from '@/features/branch/filters/branchListParams';
import type {
  BranchListQuery,
  BranchSortDir,
  BranchSortField,
  BranchStatusFilter,
} from '@/features/branch/filters/branchListParams';

export interface UseBranchListParams {
  readonly query: BranchListQuery;
  readonly setSearch: (value: string) => void;
  readonly setStatus: (value: BranchStatusFilter) => void;
  readonly setSort: (field: BranchSortField, dir: BranchSortDir) => void;
  readonly toggleSort: (field: BranchSortField) => void;
  readonly setPageSize: (size: number) => void;
  readonly setPage: (page: number) => void;
  readonly clearFilters: () => void;
}

// Any change to search / status / sort / pageSize resets `page` to 1 — an
// offset page number is only meaningful against a fixed result set. `setPage`
// is the sole mover that keeps the rest of the query intact.
export function useBranchListParams(): UseBranchListParams {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parseBranchListParams(searchParams),
    [searchParams],
  );

  const commit = useCallback(
    (next: BranchListQuery) => {
      setSearchParams(serializeBranchListParams(next));
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (value: string) => commit({ ...query, search: value, page: 1 }),
    [commit, query],
  );

  const setStatus = useCallback(
    (value: BranchStatusFilter) => commit({ ...query, status: value, page: 1 }),
    [commit, query],
  );

  const setSort = useCallback(
    (field: BranchSortField, dir: BranchSortDir) =>
      commit({ ...query, sortField: field, sortDir: dir, page: 1 }),
    [commit, query],
  );

  const toggleSort = useCallback(
    (field: BranchSortField) => {
      let dir: BranchSortDir = 'asc';
      if (query.sortField === field && query.sortDir === 'asc') {
        dir = 'desc';
      }
      commit({ ...query, sortField: field, sortDir: dir, page: 1 });
    },
    [commit, query],
  );

  const setPageSize = useCallback(
    (size: number) => commit({ ...query, pageSize: size, page: 1 }),
    [commit, query],
  );

  const setPage = useCallback(
    (page: number) => commit({ ...query, page }),
    [commit, query],
  );

  const clearFilters = useCallback(
    () => commit(clearBranchFiltersPure(query)),
    [commit, query],
  );

  return {
    query,
    setSearch,
    setStatus,
    setSort,
    toggleSort,
    setPageSize,
    setPage,
    clearFilters,
  };
}
