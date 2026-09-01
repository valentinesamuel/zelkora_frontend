import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';

import { isCursorResult } from '@/lib/query';
import type { PaginatedResult, QueryBuilder, QueryState } from '@/lib/query';

import { patientQueryMeta } from '@/features/patients/api/patient.queryMeta';
import { patientQueryKeys } from '@/features/patients/api/patients.keys';
import { patientsRepository } from '@/features/patients/api/patientsRepository';
import type { Patient } from '@/features/patients/types/patient.types';

export type PatientQueryBuilder<
  Selected extends keyof Patient & string = never,
> = QueryBuilder<Patient, typeof patientQueryMeta, Selected>;

// Result row shape for a query with a given `Selected` field set: the full
// `Patient` when nothing was `.select()`-ed (the common case, and the only
// case before this field-projection wiring), otherwise the narrowed pick —
// matching exactly what the server actually returns for that request.
type PatientRow<Selected extends keyof Patient & string> = [Selected] extends [
  never,
]
  ? Patient
  : Pick<Patient, Selected>;

// ---------------------------------------------------------------------------
// Thin repository wrappers.
// ---------------------------------------------------------------------------

function listPatients<Selected extends keyof Patient & string = never>(
  state: QueryState,
): Promise<PaginatedResult<PatientRow<Selected>>> {
  return patientsRepository.list<PatientRow<Selected>>(state);
}

export const patientsApi = {
  list: listPatients,
  get: (id: string) => patientsRepository.get(id),
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function usePatients<Selected extends keyof Patient & string = never>(
  query: PatientQueryBuilder<Selected>,
) {
  const state = query.build();
  return useQuery<PaginatedResult<PatientRow<Selected>>>({
    queryKey: patientQueryKeys.list(state),
    queryFn: () => patientsApi.list<Selected>(state),
    placeholderData: keepPreviousData,
  });
}

export function usePatientsInfinite<
  Selected extends keyof Patient & string = never,
>(query: PatientQueryBuilder<Selected>) {
  const baseState = query.build();
  return useInfiniteQuery<
    PaginatedResult<PatientRow<Selected>>,
    Error,
    InfiniteData<PaginatedResult<PatientRow<Selected>>>,
    QueryKey,
    string | null
  >({
    queryKey: patientQueryKeys.infinite(baseState),
    initialPageParam: null as string | null,
    // The same base `query` builder is re-used for every page (re-applying
    // `.cursor()` onto it rather than rebuilding sort/limit from scratch) so
    // the cursor is always echoed with an IDENTICAL sort/limit to the page
    // that produced it (INV-B2/B3). `withTotal` is only requested on the
    // first page (D5).
    queryFn: ({ pageParam }) =>
      patientsApi.list<Selected>(
        pageParam === null
          ? query.withTotal(true).build()
          : query.cursor(pageParam).build(),
      ),
    getNextPageParam: (lastPage) =>
      isCursorResult(lastPage) ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function usePatient(id: string) {
  return useQuery<Patient>({
    queryKey: patientQueryKeys.detail(id),
    queryFn: () => patientsApi.get(id),
    enabled: id.length > 0,
  });
}
