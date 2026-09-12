export const APPOINTMENT_STATUS_VALUES = [
  'SCHEDULED',
  'CONFIRMED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUS_VALUES)[number];

export const APPOINTMENT_TYPE_VALUES = [
  'CONSULTATION',
  'FOLLOW_UP',
  'PROCEDURE',
  'LAB',
  'VACCINATION',
  'EMERGENCY',
] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPE_VALUES)[number];

export interface Appointment {
  readonly id: string;
  readonly patientId: string;
  readonly staffId: string;
  readonly branchId: string;
  readonly status: AppointmentStatus;
  readonly type: AppointmentType;
  readonly reason: string | null;
  readonly startAt: string; // RFC3339
  readonly endAt: string; // RFC3339
  readonly notes: string | null;
  readonly createdAt: string; // RFC3339
  readonly updatedAt: string; // RFC3339
}

// `POST /appointments` body — mirrors `CreateAppointmentRequest` in
// `internal/appointment/dto.go:26-36` field for field.
//
// `branchId` is role-conditional: sent only for admin callers (carrying the
// branch selected in the global switcher); silently ignored for non-admins,
// whose JWT branch is authoritative. The key is omitted entirely for
// non-admins — never sent as `undefined`.
//
// `status` is optional and defaults to `SCHEDULED` server-side.
export interface CreateAppointmentBody {
  branchId?: string;
  patientId: string;
  staffId: string;
  status?: AppointmentStatus;
  type: AppointmentType;
  reason?: string;
  startAt: string; // RFC3339
  endAt: string; // RFC3339
  notes?: string;
}

// `PATCH /appointments/:id` body — mirrors `UpdateAppointmentRequest` in
// `internal/appointment/dto.go:45-54`. Every field is optional; only what is
// present is changed. There is deliberately NO `branchId`: an appointment
// never changes branch via PATCH. A reschedule is just `startAt`/`endAt`.
export interface UpdateAppointmentBody {
  patientId?: string;
  staffId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  reason?: string;
  startAt?: string; // RFC3339
  endAt?: string; // RFC3339
  notes?: string;
}
