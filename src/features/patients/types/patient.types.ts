// Patient domain + presentation types.
//
// `PatientWire` mirrors the backend `PatientResponse` (zelkora_backend
// internal/patient/dto.go) exactly — snake/camel already matches, the Go layer
// emits camelCase. `Patient` is the shape the table renders. `toPatient` is the
// only bridge between them and is pure (inject `now` in tests).

import { calculateAge } from '@/features/patients/format';
import { initialsOf } from '@/lib/name';

/** `"Adebayo Okonkwo"` -> `"AO"`, `"Chidi"` -> `"C"`, `""` -> `"?"`. */
export { initialsOf as patientInitials } from '@/lib/name';

export type PatientSex = 'male' | 'female' | 'other';
export type PatientPaymentType = 'hmo' | 'cash' | 'corporate';

// Union kept open for a future backend `"deceased"` — today only the first two
// are reachable (derived from `isActive`).
export type PatientStatus = 'active' | 'inactive' | 'deceased';

export interface PatientNextOfKin {
  readonly name: string;
  readonly phone: string;
  readonly relationship: string;
  readonly address: string;
}

/** Exact wire shape from `GET /api/v1/patients`. Optional fields use `?` + may be absent. */
export interface PatientWire {
  readonly id: string;
  readonly zrn: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly middleName?: string;
  readonly email?: string;
  readonly phoneNumber: string;
  readonly dateOfBirth: string; // "YYYY-MM-DD"
  readonly gender: PatientSex;
  readonly bloodGroup?: string;
  readonly maritalStatus?: string;
  readonly address?: string;
  readonly nationality?: string;
  readonly occupation?: string;
  readonly paymentType: PatientPaymentType;
  readonly nextOfKin: PatientNextOfKin;
  readonly lgaId?: string;
  readonly isActive: boolean;
  readonly createdAt: string; // RFC3339
  readonly updatedAt: string; // RFC3339
}

/**
 * Wire shape of `GET /api/v1/patients` (list). Mirrors the backend
 * `ListPatientsResponse` (zelkora_backend internal/patient/dto.go) — page-based
 * pagination, `total` is a real count.
 */
export interface ListPatientsWire {
  readonly patients: PatientWire[];
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

/**
 * Request body for `POST /api/v1/patients`. Mirrors the backend
 * `CreatePatientRequest` minus `lgaId` (no endpoint to populate an LGA picker
 * yet) and minus `branchId` (taken from the JWT, never sent). Optional fields
 * are omitted entirely when empty rather than sent as `null` / `""`.
 */
export interface CreatePatientBody {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  gender: PatientSex;
  bloodGroup?: string;
  maritalStatus?: string;
  address?: string;
  nationality?: string;
  occupation?: string;
  paymentType: PatientPaymentType;
  nextOfKin: PatientNextOfKin;
}

/**
 * Request body for `PATCH /api/v1/patients/:id`. Mirrors the backend
 * `UpdatePatientRequest` minus `lgaId` / `branchId`. Every field optional — only
 * dirty fields are sent. NOTE: the backend skips a field sent as JSON `null`
 * (keeps the old value); send `""` to actually blank an optional text field.
 * `nextOfKin`, when present, must be the complete object (all four sub-fields).
 */
export interface UpdatePatientBody {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // "YYYY-MM-DD"
  gender?: PatientSex;
  bloodGroup?: string;
  maritalStatus?: string;
  address?: string;
  nationality?: string;
  occupation?: string;
  paymentType?: PatientPaymentType;
  nextOfKin?: PatientNextOfKin;
  isActive?: boolean;
}

/** Presentation model — what `PatientTable` and its cells consume. */
export interface Patient {
  readonly id: string;
  readonly zrn: string;
  readonly fullName: string;
  readonly initials: string;
  readonly age: number | null;
  readonly sex: PatientSex;
  readonly phone: string | null;
  readonly email: string | null;
  readonly paymentType: PatientPaymentType;
  readonly status: PatientStatus;
  readonly registeredAt: string; // RFC3339, from `createdAt`
  // No backend field yet — always `null`. Kept so the column + a real value
  // can land without touching call sites.
  readonly lastVisitAt: string | null;
}

function trimToNull(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function fullNameOf(
  wire: Pick<PatientWire, 'firstName' | 'middleName' | 'lastName'>,
): string {
  return [wire.firstName, wire.middleName, wire.lastName]
    .map((part) => part?.trim() ?? '')
    .filter(Boolean)
    .join(' ');
}

/** Pure wire -> presentation mapper. `now` is injectable for deterministic tests. */
export function toPatient(wire: PatientWire, now: Date = new Date()): Patient {
  const fullName = fullNameOf(wire);
  return {
    id: wire.id,
    zrn: wire.zrn,
    fullName,
    initials: initialsOf(fullName),
    age: calculateAge(wire.dateOfBirth, now),
    sex: wire.gender,
    phone: trimToNull(wire.phoneNumber),
    email: trimToNull(wire.email),
    paymentType: wire.paymentType,
    status: wire.isActive ? 'active' : 'inactive',
    registeredAt: wire.createdAt,
    lastVisitAt: null,
  };
}
