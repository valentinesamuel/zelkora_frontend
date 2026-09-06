export { initialsOf as patientInitials } from '@/lib/name';

export type PatientSex = 'male' | 'female' | 'other';
export const PATIENT_SEX_VALUES = [
  'male',
  'female',
  'other',
] as const satisfies readonly PatientSex[];

export type PatientPaymentType = 'hmo' | 'cash' | 'corporate';
export const PATIENT_PAYMENT_TYPE_VALUES = [
  'hmo',
  'cash',
  'corporate',
] as const satisfies readonly PatientPaymentType[];

export type PatientStatus = 'active' | 'inactive' | 'deceased';
export const PATIENT_STATUS_VALUES: readonly PatientStatus[] = [
  'active',
  'inactive',
  'deceased',
];

export interface PatientNextOfKin {
  readonly name: string;
  readonly phone: string;
  readonly relationship: string;
  readonly address: string;
}

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
  // Sent only for admin callers, carrying the branch selected in the global
  // switcher (`useDashboardFiltersStore.branchId`). The backend ignores it for
  // non-admins (the JWT branch is authoritative) and requires it for admins.
  // The key is omitted entirely for non-admins — never sent as `undefined`.
  branchId?: string;
}

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
