import type { ColumnType, EntityQueryMeta } from '@/lib/query';
import { defineEntityQuery } from '@/lib/query';

import type { Appointment } from '@/features/appointments/types/appointment.types';
import {
  APPOINTMENT_STATUS_VALUES,
  APPOINTMENT_TYPE_VALUES,
} from '@/features/appointments/types/appointment.types';

const COLUMN_TYPE_UUID: ColumnType = 'uuid';
const COLUMN_TYPE_TEXT: ColumnType = 'text';
const COLUMN_TYPE_TIMESTAMPTZ: ColumnType = 'timestamptz';

export const appointmentQueryMeta = {
  // appointmentcols.AppointmentEntityName — see appointmentcols/metadata.go:12.
  entity: 'Appointment',

  // AllowedFilters (10) — internal/appointment/queryconfig.go:31-42.
  fields: {
    id: { type: COLUMN_TYPE_UUID },
    // NO-OP: the handler force-overwrites `filter[branchId]` from the JWT
    // (INV-2). Kept here only because it IS in the Go AllowedFilters list —
    // and it must be, since a forced filter that is not whitelisted 400s.
    branchId: { type: COLUMN_TYPE_UUID },
    patientId: { type: COLUMN_TYPE_UUID },
    staffId: { type: COLUMN_TYPE_UUID },
    // `status` / `type` are TEXT columns on the backend (Go-side `.Valid()`
    // validation, no Postgres ENUM). The value sets are imported from the
    // type unions and never re-declared here (INV-D2).
    status: { type: COLUMN_TYPE_TEXT, values: APPOINTMENT_STATUS_VALUES },
    type: { type: COLUMN_TYPE_TEXT, values: APPOINTMENT_TYPE_VALUES },
    startAt: { type: COLUMN_TYPE_TIMESTAMPTZ },
    endAt: { type: COLUMN_TYPE_TIMESTAMPTZ },
    // `deletedAt` is what makes `withDeleted=true` legal (INV-1).
    deletedAt: { type: COLUMN_TYPE_TIMESTAMPTZ },
    createdAt: { type: COLUMN_TYPE_TIMESTAMPTZ },
  },

  // AllowedSort (4) — queryconfig.go:44-49.
  sortFields: ['startAt', 'createdAt', 'status', 'id'],

  // AllowedSearch is nil — queryconfig.go:54. There are no trigram indexes on
  // this table and clinical free text (reason/notes) is deliberately not a
  // search surface.
  searchFields: [],

  // AllowedRelations (3) — queryconfig.go:59-63. ManyToOne paths only.
  relations: ['patient', 'staff', 'branch'],

  // AllowedFields is unrestricted server-side (`AllowedFields: nil`,
  // queryconfig.go:69) — any root column of `Appointment` may be projected.
  projectableFields: [
    'id',
    'patientId',
    'staffId',
    'branchId',
    'status',
    'type',
    'reason',
    'startAt',
    'endAt',
    'notes',
    'createdAt',
    'updatedAt',
  ],
} as const satisfies EntityQueryMeta<Appointment>;

export const appointmentQuery = defineEntityQuery<
  Appointment,
  typeof appointmentQueryMeta
>(appointmentQueryMeta);
