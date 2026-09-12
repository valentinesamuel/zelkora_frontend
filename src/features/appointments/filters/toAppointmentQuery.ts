// The single translation seam between the URL-backed list UI state
// (`AppointmentListQuery`) and the backend query contract (an Appointment
// `QueryBuilder`). Pure: no I/O, no React, no `new Date()`.
//
// Deliberately absent:
//   - `filter[branchId]` — the handler force-overwrites it from the JWT
//     (INV-2, `appointment.queryMeta.ts`), so sending one is a no-op.
//   - `.search(...)` — `appointmentQueryMeta.searchFields` is empty
//     (AllowedSearch is nil server-side); calling it throws
//     `QueryValidationError`.
//   - a trailing `id` sort — the backend always appends `id ASC` (INV-Q8).
//   - `.cursor(...)` — the list page pages by offset, not cursor.

import { appointmentQuery } from '@/features/appointments/api/appointment.queryMeta';
import type { AppointmentQueryBuilder } from '@/features/appointments/api/useAppointments';
import type { AppointmentListQuery } from '@/features/appointments/filters/appointmentListParams';

const FIELD_START_AT = 'startAt';
const OP_GTE = 'gte';
const OP_LTE = 'lte';

type Builder = AppointmentQueryBuilder;

// The date filters are calendar dates (`YYYY-MM-DD`) but `startAt` is a
// `timestamptz`, so each bound is widened to the whole UTC day by string
// concatenation. Deliberately NOT `new Date(...)`: composing through a Date
// would make the boundary depend on the machine's timezone and on this
// module staying pure.
function startOfDayUtc(day: string): string {
  return `${day}T00:00:00Z`;
}

function endOfDayUtc(day: string): string {
  return `${day}T23:59:59Z`;
}

function applyStatus(
  builder: Builder,
  status: AppointmentListQuery['status'],
): Builder {
  if (status === 'all') return builder;
  return builder.where('status', 'eq', status);
}

function applyType(
  builder: Builder,
  type: AppointmentListQuery['type'],
): Builder {
  if (type === 'all') return builder;
  return builder.where('type', 'eq', type);
}

function applyParticipants(
  builder: Builder,
  patientId: string | null,
  staffId: string | null,
): Builder {
  let next = builder;
  if (patientId !== null) next = next.where('patientId', 'eq', patientId);
  if (staffId !== null) next = next.where('staffId', 'eq', staffId);
  return next;
}

// `filter[startAt][gte]` / `filter[startAt][lte]`.
function applyStartRange(
  builder: Builder,
  from: string | null,
  to: string | null,
): Builder {
  let next = builder;
  if (from !== null) {
    next = next.where(FIELD_START_AT, OP_GTE, startOfDayUtc(from));
  }
  if (to !== null) {
    next = next.where(FIELD_START_AT, OP_LTE, endOfDayUtc(to));
  }
  return next;
}

export function toAppointmentQuery(
  ui: AppointmentListQuery,
): AppointmentQueryBuilder {
  let builder = appointmentQuery();

  builder = applyStatus(builder, ui.status);
  builder = applyType(builder, ui.type);
  builder = applyParticipants(builder, ui.patientId, ui.staffId);
  builder = applyStartRange(builder, ui.startFrom, ui.startTo);
  builder = builder.sort(ui.sortField, ui.sortDir);

  // No `.select(...)`: the table renders the joined `patient`/`staff` objects
  // alongside root columns, and a root projection would add nothing but a
  // second list to keep in sync (AllowedFields is unrestricted server-side).
  // `StaffListPage` includes relations the same way.
  return builder
    .include('patient')
    .include('staff')
    .offset(ui.page, ui.pageSize)
    .withTotal(true);
}
