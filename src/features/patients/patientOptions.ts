import { NATIONALITIES } from '@/features/patients/data/nationalities';
import {
  PatientPaymentTypeEnum,
  PatientSexEnum,
} from '@/features/patients/types/patient.types';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export const GENDER_OPTIONS: readonly SelectOption[] = [
  { value: PatientSexEnum.MALE, label: 'Male' },
  { value: PatientSexEnum.FEMALE, label: 'Female' },
  { value: PatientSexEnum.OTHER, label: 'Other' },
];

export const PAYMENT_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: PatientPaymentTypeEnum.HMO, label: 'HMO' },
  { value: PatientPaymentTypeEnum.CASH, label: 'Cash' },
  { value: PatientPaymentTypeEnum.CORPORATE, label: 'Corporate' },
];

export const BLOOD_GROUP_OPTIONS: readonly SelectOption[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
].map((g) => ({ value: g, label: g }));

export const MARITAL_STATUS_OPTIONS: readonly SelectOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
];

export const NATIONALITY_OPTIONS: readonly SelectOption[] = NATIONALITIES.map(
  (n) => ({ value: n, label: n }),
);
