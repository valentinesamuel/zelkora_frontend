import { calculateAge } from '@/features/patients/format';
import {
  fullNameOf,
  type Patient,
  type PatientStatus,
} from '@/features/patients/types/patient.types';
import { initialsOf } from '@/lib/name';

export function patientFullName(
  patient: Pick<Patient, 'firstName' | 'middleName' | 'lastName'>,
): string {
  return fullNameOf(patient);
}

export function patientInitialsOf(
  patient: Pick<Patient, 'firstName' | 'middleName' | 'lastName'>,
): string {
  return initialsOf(fullNameOf(patient));
}

export function patientAge(
  patient: Pick<Patient, 'dateOfBirth'>,
  now: Date = new Date(),
): number | null {
  return calculateAge(patient.dateOfBirth, now);
}

export function patientDisplayStatus(
  patient: Pick<Patient, 'isActive'>,
): PatientStatus {
  if (patient.isActive) {
    return 'active';
  }
  return 'inactive';
}

export function patientLastVisitAt(): string | null {
  return null;
}
