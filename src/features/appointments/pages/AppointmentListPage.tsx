import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { isOffsetResult } from '@/lib/query';
import { useAppointments } from '@/features/appointments/api/useAppointments';
import { AppointmentFilters } from '@/features/appointments/components/AppointmentFilters';
import { AppointmentTable } from '@/features/appointments/components/AppointmentTable';
import type { AppointmentListRow } from '@/features/appointments/components/appointmentColumns';
import {
  hasActiveQuery,
  LIMIT_OPTIONS,
} from '@/features/appointments/filters/appointmentListParams';
import { toAppointmentQuery } from '@/features/appointments/filters/toAppointmentQuery';
import { useAppointmentListParams } from '@/features/appointments/filters/useAppointmentListParams';
import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';

const countFormatter = new Intl.NumberFormat('en-NG');

export function AppointmentListPage() {
  const {
    query,
    setStatus,
    setType,
    setPatientId,
    setStaffId,
    setStartRange,
    toggleSort,
    setPageSize,
    setPage,
    clearFilters,
  } = useAppointmentListParams();

  const appointmentsQuery = useMemo(() => toAppointmentQuery(query), [query]);
  const { data, isPending, isError, isFetching, refetch } =
    useAppointments(appointmentsQuery);

  const filtersActive = hasActiveQuery(query);

  let results: ReactNode;
  if (isPending) {
    results = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: query.pageSize }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    );
  } else if (isError) {
    results = (
      <div className="flex flex-col items-start gap-3 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Something went wrong loading appointments.
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  } else {
    // The `patient`/`staff` join objects arrive alongside the root columns but
    // are not part of the Phase 11 `Appointment` type, which describes the
    // root row only. This is the one place the widened row shape is asserted.
    const rows = [...data.data] as AppointmentListRow[];

    let total = rows.length;
    if (isOffsetResult(data)) {
      total = data.total;
    }

    if (rows.length === 0) {
      let emptyMessage = 'No appointments scheduled yet.';
      if (filtersActive) {
        emptyMessage = 'No appointments match these filters.';
      }
      results = (
        <div className="flex flex-col items-start gap-3 rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          {filtersActive && (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      );
    } else {
      const rangeStart = (query.page - 1) * query.pageSize + 1;
      const rangeEnd = rangeStart + rows.length - 1;
      const hasPrev = query.page > 1;
      const hasNext = query.page * query.pageSize < total;

      results = (
        <div className="flex flex-col gap-4">
          {/* Dim only on a background refetch (filter change, page change) —
              the previous page stays visible under `keepPreviousData` while
              the next one loads. */}
          <div
            className={cn(
              'transition-opacity motion-reduce:transition-none',
              isFetching && 'pointer-events-none opacity-60',
            )}
            aria-busy={isFetching}
          >
            <AppointmentTable
              appointments={rows}
              sort={query}
              onToggleSort={toggleSort}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Showing {countFormatter.format(rangeStart)}&ndash;
              {countFormatter.format(rangeEnd)} of{' '}
              {countFormatter.format(total)} appointments
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Per page</span>
                <Select
                  value={String(query.pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label="Appointments per page"
                    className="w-16"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIMIT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(query.page - 1)}
                  disabled={!hasPrev}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(query.page + 1)}
                  disabled={!hasNext}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Appointments
          </h1>
          <p className="text-sm text-muted-foreground">
            The schedule for this branch.
          </p>
        </div>
        <Can permission={[PERMISSIONS.APPOINTMENT.CREATE]}>
          <Button asChild>
            <Link to="/appointments/new">
              <Plus aria-hidden="true" />
              Schedule appointment
            </Link>
          </Button>
        </Can>
      </header>

      {/* Remounted whenever either picker's id changes in the URL, so the
          local RHF defaults inside always start from the params (including
          after "Clear filters" and after a back/forward navigation). */}
      <AppointmentFilters
        key={`${query.patientId ?? ''}-${query.staffId ?? ''}`}
        query={query}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onPatientChange={setPatientId}
        onStaffChange={setStaffId}
        onStartRangeChange={setStartRange}
        onClear={clearFilters}
      />

      {results}
    </div>
  );
}
