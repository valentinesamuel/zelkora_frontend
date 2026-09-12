import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  clearAppointmentFilters as clearAppointmentFiltersPure,
  parseAppointmentListParams,
  serializeAppointmentListParams,
} from '@/features/appointments/filters/appointmentListParams';
import type {
  AppointmentListQuery,
  AppointmentSortDir,
  AppointmentSortField,
  AppointmentStatusFilter,
  AppointmentTypeFilter,
} from '@/features/appointments/filters/appointmentListParams';

export interface UseAppointmentListParams {
  readonly query: AppointmentListQuery;
  readonly setStatus: (value: AppointmentStatusFilter) => void;
  readonly setType: (value: AppointmentTypeFilter) => void;
  readonly setPatientId: (value: string | null) => void;
  readonly setStaffId: (value: string | null) => void;
  readonly setStartRange: (from: string | null, to: string | null) => void;
  readonly setSort: (
    field: AppointmentSortField,
    dir: AppointmentSortDir,
  ) => void;
  readonly toggleSort: (field: AppointmentSortField) => void;
  readonly setPageSize: (size: number) => void;
  readonly setPage: (page: number) => void;
  readonly clearFilters: () => void;
}

// Any change to a filter / sort / pageSize resets `page` to 1 — an offset page
// number is only meaningful against a fixed result set. `setPage` is the sole
// mover that keeps the rest of the query intact. Mirrors
// `useBranchListParams`.
export function useAppointmentListParams(): UseAppointmentListParams {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parseAppointmentListParams(searchParams),
    [searchParams],
  );

  const commit = useCallback(
    (next: AppointmentListQuery) => {
      setSearchParams(serializeAppointmentListParams(next));
    },
    [setSearchParams],
  );

  const setStatus = useCallback(
    (value: AppointmentStatusFilter) =>
      commit({ ...query, status: value, page: 1 }),
    [commit, query],
  );

  const setType = useCallback(
    (value: AppointmentTypeFilter) =>
      commit({ ...query, type: value, page: 1 }),
    [commit, query],
  );

  const setPatientId = useCallback(
    (value: string | null) => commit({ ...query, patientId: value, page: 1 }),
    [commit, query],
  );

  const setStaffId = useCallback(
    (value: string | null) => commit({ ...query, staffId: value, page: 1 }),
    [commit, query],
  );

  const setStartRange = useCallback(
    (from: string | null, to: string | null) =>
      commit({ ...query, startFrom: from, startTo: to, page: 1 }),
    [commit, query],
  );

  const setSort = useCallback(
    (field: AppointmentSortField, dir: AppointmentSortDir) =>
      commit({ ...query, sortField: field, sortDir: dir, page: 1 }),
    [commit, query],
  );

  const toggleSort = useCallback(
    (field: AppointmentSortField) => {
      let dir: AppointmentSortDir = 'asc';
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
    () => commit(clearAppointmentFiltersPure(query)),
    [commit, query],
  );

  return {
    query,
    setStatus,
    setType,
    setPatientId,
    setStaffId,
    setStartRange,
    setSort,
    toggleSort,
    setPageSize,
    setPage,
    clearFilters,
  };
}
