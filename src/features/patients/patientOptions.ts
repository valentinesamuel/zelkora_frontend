import { NATIONALITIES } from '@/features/patients/data/nationalities';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export const GENDER_OPTIONS: readonly SelectOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const PAYMENT_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: 'hmo', label: 'HMO' },
  { value: 'cash', label: 'Cash' },
  { value: 'corporate', label: 'Corporate' },
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
