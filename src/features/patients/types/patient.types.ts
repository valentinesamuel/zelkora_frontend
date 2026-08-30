// Patient domain types.
//
// `Patient` mirrors the backend `PatientResponse` (zelkora_backend
// internal/patient/dto.go) exactly — snake/camel already matches, the Go layer
// emits camelCase. It is the single patient shape: the API returns it and the UI
// renders it directly, deriving display values (full name, age, status, …) at
// render time via `patientView.ts`.

/** `"Adebayo Okonkwo"` -> `"AO"`, `"Chidi"` -> `"C"`, `""` -> `"?"`. */
export { initialsOf as patientInitials } from '@/lib/name';

export enum PatientSexEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum PatientPaymentTypeEnum {
  HMO = 'hmo',
  CASH = 'cash',
  CORPORATE = 'corporate',
}

// `DECEASED` is kept for a future backend value — today only ACTIVE / INACTIVE
// are reachable (derived from `isActive`).
export enum PatientStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
}

/** Aliases for annotations; identical to the enums above. */
export type PatientSex = PatientSexEnum;
export type PatientPaymentType = PatientPaymentTypeEnum;
export type PatientStatus = PatientStatusEnum;

export interface PatientNextOfKin {
  readonly name: string;
  readonly phone: string;
  readonly relationship: string;
  readonly address: string;
}

/** Exact shape from `GET /api/v1/patients`. Optional fields use `?` + may be absent. */
export interface Patient {
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
export interface ListPatientsResponse {
  readonly patients: Patient[];
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

export function fullNameOf(
  patient: Pick<Patient, 'firstName' | 'middleName' | 'lastName'>,
): string {
  return [patient.firstName, patient.middleName, patient.lastName]
    .map((part) => part?.trim() ?? '')
    .filter(Boolean)
    .join(' ');
}
