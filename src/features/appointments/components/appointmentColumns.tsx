import type { ColumnDef } from '@tanstack/react-table';

import { AppointmentRowActions } from '@/features/appointments/components/AppointmentRowActions';
import { AppointmentSortableHeader } from '@/features/appointments/components/AppointmentSortableHeader';
import { AppointmentStatusBadge } from '@/features/appointments/components/AppointmentStatusBadge';
import {
  formatAppointmentDateTime,
  formatAppointmentTime,
} from '@/features/appointments/format';
import { APPOINTMENT_TYPE_OPTIONS } from '@/features/appointments/appointmentOptions';
import type { Appointment } from '@/features/appointments/types/appointment.types';

// Join object for `include=patient`. The appointment query config sets
// `AllowedFields: nil`, so the engine falls back to the full column set of the
// joined table — but nothing in the Phase 11 types pins that shape, so every
// field beyond `id` is optional here and rendered defensively.
export interface AppointmentPatientRef {
  readonly id: string;
  readonly firstName?: string;
  readonly middleName?: string | null;
  readonly lastName?: string;
  readonly zrn?: string;
}

// Join object for `include=staff`. NOTE: this is the `staff` row, which holds
// `staffNumber`/`profession` and NOT a person's name — the name lives on
// `users`, and `user` is not in the appointment `AllowedRelations`
// (internal/appointment/queryconfig.go). The staff column therefore shows the
// staff number, which is the only human-readable identifier a single
// `GET /appointments` can return.
export interface AppointmentStaffRef {
  readonly id: string;
  readonly staffNumber?: string;
  readonly profession?: string;
}

export interface AppointmentListRow extends Appointment {
  // `null` means the joined row is soft-deleted, not "not requested" — the
  // engine always emits the key when the relation is in the query plan
  // (same semantics as `StaffListItem.user`).
  readonly patient?: AppointmentPatientRef | null;
  readonly staff?: AppointmentStaffRef | null;
}

const EMPTY_CELL = '—';

const MONO_CELL = 'font-mono text-xs tabular-nums';

export function appointmentPatientName(row: AppointmentListRow): string {
  const patient = row.patient;
  if (!patient) return EMPTY_CELL;
  const name = [patient.firstName, patient.middleName, patient.lastName]
    .map((part) => part?.trim() ?? '')
    .filter(Boolean)
    .join(' ');
  return name || patient.zrn || EMPTY_CELL;
}

export function appointmentStaffName(row: AppointmentListRow): string {
  const staff = row.staff;
  if (!staff) return EMPTY_CELL;
  return staff.staffNumber || staff.profession || EMPTY_CELL;
}

function typeLabel(value: string): string {
  return (
    APPOINTMENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
  );
}

export const appointmentColumns: ColumnDef<AppointmentListRow>[] = [
  {
    id: 'patient',
    enableSorting: false,
    header: 'Patient',
    cell: ({ row }) => appointmentPatientName(row.original),
    meta: { headerClassName: 'min-w-48', cellClassName: 'font-medium' },
  },
  {
    id: 'staff',
    enableSorting: false,
    header: 'Staff',
    cell: ({ row }) => appointmentStaffName(row.original),
    meta: { headerClassName: 'min-w-40', cellClassName: MONO_CELL },
  },
  {
    id: 'type',
    enableSorting: false,
    header: 'Type',
    cell: ({ row }) => typeLabel(row.original.type),
    meta: { headerClassName: 'w-36' },
  },
  {
    id: 'status',
    enableSorting: false,
    header: ({ table }) => (
      <AppointmentSortableHeader
        label="Status"
        sortKey="status"
        meta={table.options.meta}
      />
    ),
    cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
    meta: { headerClassName: 'w-36', sortKey: 'status' },
  },
  {
    id: 'startAt',
    enableSorting: false,
    header: ({ table }) => (
      <AppointmentSortableHeader
        label="Start"
        sortKey="startAt"
        meta={table.options.meta}
      />
    ),
    cell: ({ row }) => formatAppointmentDateTime(row.original.startAt),
    meta: { headerClassName: 'w-48', sortKey: 'startAt' },
  },
  {
    id: 'endAt',
    enableSorting: false,
    header: 'End',
    // Time only: the end of a slot is always the same calendar day as its
    // start in practice, and repeating the date twice per row is noise.
    cell: ({ row }) => formatAppointmentTime(row.original.endAt),
    meta: {
      headerClassName: 'w-24',
      cellClassName: 'text-muted-foreground tabular-nums',
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <AppointmentRowActions appointment={row.original} />,
    meta: { headerClassName: 'w-11', cellClassName: 'text-right' },
  },
];
