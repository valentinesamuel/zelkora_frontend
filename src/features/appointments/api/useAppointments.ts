import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { PaginatedResult, QueryBuilder, QueryState } from '@/lib/query';

import { appointmentQueryMeta } from '@/features/appointments/api/appointment.queryMeta';
import { appointmentQueryKeys } from '@/features/appointments/api/appointments.keys';
import { appointmentsRepository } from '@/features/appointments/api/appointmentsRepository';
import type { Appointment } from '@/features/appointments/types/appointment.types';

export type AppointmentQueryBuilder<
  Selected extends keyof Appointment & string = never,
> = QueryBuilder<Appointment, typeof appointmentQueryMeta, Selected>;

// Result row shape for a query with a given `Selected` field set: the full
// `Appointment` when nothing was `.select()`-ed, otherwise the narrowed pick —
// matching exactly what the server returns for that request.
type AppointmentRow<Selected extends keyof Appointment & string> = [
  Selected,
] extends [never]
  ? Appointment
  : Pick<Appointment, Selected>;

function listAppointments<Selected extends keyof Appointment & string = never>(
  state: QueryState,
): Promise<PaginatedResult<AppointmentRow<Selected>>> {
  return appointmentsRepository.list<AppointmentRow<Selected>>(state);
}

// Parameterised list query, mirroring `useBranches`.
//
// OFFSET pagination (page numbers), NOT cursor: appointments are browsed as a
// numbered, jumpable schedule, so this is `useQuery` + `.offset(page, size)`
// rather than patients' `useInfiniteQuery` + "Load more". `keepPreviousData`
// keeps the current page rendered while the next one loads instead of
// flashing an empty table.
//
// Page size must never exceed `MAX_LIMIT` (50) in `src/lib/query/builder.ts` —
// the builder throws `QueryValidationError` above it.
export function useAppointments<
  Selected extends keyof Appointment & string = never,
>(query: AppointmentQueryBuilder<Selected>) {
  const state = query.build();
  return useQuery<PaginatedResult<AppointmentRow<Selected>>>({
    queryKey: appointmentQueryKeys.list(state),
    queryFn: () => listAppointments<Selected>(state),
    placeholderData: keepPreviousData,
  });
}
