// Thin bridge: `useSearchParams` <-> `PatientListQuery`. All parsing, healing
// and serialisation live in the pure `patientListParams` module; this hook only
// wires it to the URL and exposes typed setters.
//
// Every setter except `goToCursor` clears the cursor first — a filtered result
// invalidates any page token. Writes are pushed (not replaced) so browser
// Back / Forward step through the list's history.

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  clearFilters as clearFiltersPure,
  parsePatientListParams,
  resetCursor,
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
  readonly goToCursor: (cursor: string | null) => void;
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
    (value: string) => commit(resetCursor({ ...query, search: value })),
    [commit, query],
  );

  const setFilters = useCallback(
    (patch: PatientListFilterPatch) =>
      commit(resetCursor({ ...query, ...patch })),
    [commit, query],
  );

  const setSort = useCallback(
    (field: PatientSortField, dir: SortDir) =>
      commit(resetCursor({ ...query, sortField: field, sortDir: dir })),
    [commit, query],
  );

  const toggleSort = useCallback(
    (field: PatientSortField) => {
      const dir: SortDir =
        query.sortField === field && query.sortDir === 'asc' ? 'desc' : 'asc';
      commit(resetCursor({ ...query, sortField: field, sortDir: dir }));
    },
    [commit, query],
  );

  const setLimit = useCallback(
    (limit: number) => commit(resetCursor({ ...query, limit })),
    [commit, query],
  );

  const goToCursor = useCallback(
    (cursor: string | null) => commit({ ...query, cursor }),
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
    goToCursor,
    clearFilters,
  };
}
