import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  clearFilters as clearFiltersPure,
  parsePatientListParams,
  serializePatientListParams,
} from '@/features/patients/filters/patientListParams';
import type {
  PatientListQuery,
  PatientSexFilter,
  PatientSortField,
  PatientStatusFilter,
  SortDir,
} from '@/features/patients/types/patientListQuery.types';

export interface PatientListFilterPatch {
  readonly status?: PatientStatusFilter;
  readonly sex?: PatientSexFilter;
  readonly ageMin?: number | null;
  readonly ageMax?: number | null;
  readonly registeredFrom?: string | null;
  readonly registeredTo?: string | null;
}

export interface UsePatientListParams {
  readonly query: PatientListQuery;
  readonly setSearch: (value: string) => void;
  readonly setFilters: (patch: PatientListFilterPatch) => void;
  readonly setSort: (field: PatientSortField, dir: SortDir) => void;
  readonly toggleSort: (field: PatientSortField) => void;
  readonly setLimit: (limit: number) => void;
  readonly clearFilters: () => void;
}

export function usePatientListParams(): UsePatientListParams {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parsePatientListParams(searchParams),
    [searchParams],
  );

  const commit = useCallback(
    (next: PatientListQuery) => {
      setSearchParams(serializePatientListParams(next));
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (value: string) => commit({ ...query, search: value }),
    [commit, query],
  );

  const setFilters = useCallback(
    (patch: PatientListFilterPatch) => commit({ ...query, ...patch }),
    [commit, query],
  );

  const setSort = useCallback(
    (field: PatientSortField, dir: SortDir) =>
      commit({ ...query, sortField: field, sortDir: dir }),
    [commit, query],
  );

  const toggleSort = useCallback(
    (field: PatientSortField) => {
      const dir: SortDir =
        query.sortField === field && query.sortDir === 'asc' ? 'desc' : 'asc';
      commit({ ...query, sortField: field, sortDir: dir });
    },
    [commit, query],
  );

  const setLimit = useCallback(
    (limit: number) => commit({ ...query, limit }),
    [commit, query],
  );

  const clearFilters = useCallback(
    () => commit(clearFiltersPure(query)),
    [commit, query],
  );

  return {
    query,
    setSearch,
    setFilters,
    setSort,
    toggleSort,
    setLimit,
    clearFilters,
  };
}
