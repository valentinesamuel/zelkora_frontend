import { calculateAge } from '@/features/patients/format';
import {
  fullNameOf,
  PatientStatusEnum,
  type Patient,
} from '@/features/patients/types/patient.types';
import { initialsOf } from '@/lib/name';

export function patientFullName(patient: Patient): string {
  return fullNameOf(patient);
}

export function patientInitialsOf(patient: Patient): string {
  return initialsOf(fullNameOf(patient));
}

export function patientAge(
  patient: Patient,
  now: Date = new Date(),
): number | null {
  return calculateAge(patient.dateOfBirth, now);
}

export function patientDisplayStatus(patient: Patient): PatientStatusEnum {
  if (patient.isActive) {
    return PatientStatusEnum.ACTIVE;
  }
  return PatientStatusEnum.INACTIVE;
}

export function patientLastVisitAt(): string | null {
  return null;
}
