import { useMemo, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { usePatientsInfinite } from '@/features/patients/api/patients.api';
import {
  countActiveFilters,
  hasActiveQuery,
} from '@/features/patients/filters/patientListParams';
import { toPatientQuery } from '@/features/patients/filters/toPatientQuery';
import { usePatientListParams } from '@/features/patients/filters/usePatientListParams';
import { PatientFilters } from '@/features/patients/components/PatientFilters';
import { PatientListError } from '@/features/patients/components/PatientListError';
import { PatientListHeader } from '@/features/patients/components/PatientListHeader';
import { PatientListEmpty } from '@/features/patients/components/PatientListEmpty';
import { PatientListPagination } from '@/features/patients/components/PatientListPagination';
import { PatientSearch } from '@/features/patients/components/PatientSearch';
import { PatientTable } from '@/features/patients/components/PatientTable';
import { PatientTableSkeleton } from '@/features/patients/components/PatientTableSkeleton';

export function PatientListPage() {
  const { query, setSearch, setFilters, toggleSort, setLimit, clearFilters } =
    usePatientListParams();

 
  const patientsQuery = useMemo(
    () => toPatientQuery(query, new Date()),
    [query],
  );

  const {
    data,
    isPending,
    isError,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = usePatientsInfinite(patientsQuery);

  const activeFilterCount = countActiveFilters(query);
  const filtersOrSearchActive = hasActiveQuery(query);

  let results: ReactNode;
  if (isPending) {
    results = <PatientTableSkeleton rows={query.limit} />;
  } else if (isError) {
    results = <PatientListError onRetry={() => void refetch()} />;
  } else {

    const patients = data.pages.flatMap((page) => [...page.data]);

    const firstPage = data.pages[0];
    let total: number | null = null;
    if (firstPage?.total !== undefined) {
      total = firstPage.total;
    }

    if (patients.length === 0) {
      let emptyVariant: 'no-results' | 'no-data' = 'no-data';
      if (filtersOrSearchActive) {
        emptyVariant = 'no-results';
      }
      results = (
        <PatientListEmpty
          variant={emptyVariant}
          onClearFilters={clearFilters}
        />
      );
    } else {
      // Dim only on a background refetch of already-loaded pages — appending
      // the next page must not grey out the rows the reader is looking at.
      const refetchingInPlace = isFetching && !isFetchingNextPage;
      results = (
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              'transition-opacity motion-reduce:transition-none',
              refetchingInPlace && 'pointer-events-none opacity-60',
            )}
            aria-busy={refetchingInPlace}
          >
            <PatientTable
              patients={patients}
              sort={query}
              onToggleSort={toggleSort}
            />
          </div>
          <PatientListPagination
            loadedCount={patients.length}
            total={total}
            limit={query.limit}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
            onLimitChange={setLimit}
          />
        </div>
      );
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <PatientListHeader />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PatientSearch value={query.search} onChange={setSearch} />
        <div className="flex items-center gap-2">
          <PatientFilters
            query={query}
            activeCount={activeFilterCount}
            onApply={setFilters}
            onClear={clearFilters}
          />
        </div>
      </div>

      {results}
    </div>
  );
}
