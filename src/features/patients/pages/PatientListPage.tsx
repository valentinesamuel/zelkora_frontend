import { cn } from '@/lib/utils';
import { usePatients } from '@/features/patients/api/patients.api';
import {
  countActiveFilters,
  hasActiveQuery,
} from '@/features/patients/filters/patientListParams';
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
  const {
    query,
    setSearch,
    setFilters,
    toggleSort,
    setLimit,
    goToCursor,
    clearFilters,
  } = usePatientListParams();

  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } =
    usePatients(query);

  const activeFilterCount = countActiveFilters(query);
  const filtersOrSearchActive = hasActiveQuery(query);

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

      {isPending ? (
        <PatientTableSkeleton rows={query.limit} />
      ) : isError ? (
        <PatientListError onRetry={() => void refetch()} />
      ) : data.patients.length === 0 ? (
        <PatientListEmpty
          variant={filtersOrSearchActive ? 'no-results' : 'no-data'}
          onClearFilters={clearFilters}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              'transition-opacity motion-reduce:transition-none',
              isFetching &&
                isPlaceholderData &&
                'pointer-events-none opacity-60',
            )}
            aria-busy={isFetching && isPlaceholderData}
          >
            <PatientTable
              patients={data.patients}
              sort={query}
              onToggleSort={toggleSort}
            />
          </div>
          <PatientListPagination
            pageCount={data.patients.length}
            total={data.total}
            limit={query.limit}
            pageInfo={data.pageInfo}
            onLimitChange={setLimit}
            onPrev={() => goToCursor(data.pageInfo.prevCursor)}
            onNext={() => goToCursor(data.pageInfo.nextCursor)}
          />
        </div>
      )}
    </div>
  );
}
