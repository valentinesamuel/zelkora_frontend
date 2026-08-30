// Patient domain + presentation types.
//
// `PatientWire` mirrors the backend `PatientResponse` (zelkora_backend
// internal/patient/dto.go) exactly — snake/camel already matches, the Go layer
// emits camelCase. `Patient` is the shape the table renders. `toPatient` is the
// only bridge between them and is pure (inject `now` in tests).

import { calculateAge } from '@/features/patients/format';

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

/** `"Adebayo Okonkwo"` -> `"AO"`, `"Chidi"` -> `"C"`, `""` -> `"?"`. */
export function patientInitials(fullName: string): string {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '?';
  const first = tokens[0]!.charAt(0);
  const last = tokens.length > 1 ? tokens[tokens.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
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
    initials: patientInitials(fullName),
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
