import { z } from 'zod';

import {
  PATIENT_PAYMENT_TYPE_VALUES,
  PATIENT_SEX_VALUES,
} from '@/features/patients/types/patient.types';

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const optionalText = z.string().trim();

const nextOfKinSchema = z.object({
  name: requiredText('Next of kin name'),
  phone: requiredText('Next of kin phone'),
  relationship: requiredText('Relationship'),
  address: requiredText('Next of kin address'),
});

export const patientFormSchema = z.object({
  firstName: requiredText('First name'),
  lastName: requiredText('Last name'),
  middleName: optionalText,
  email: optionalText.refine(
    (v) => v === '' || z.string().email().safeParse(v).success,
    { message: 'Enter a valid email address.' },
  ),
  phoneNumber: requiredText('Phone number'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date of birth (YYYY-MM-DD).'),
  gender: z.enum(PATIENT_SEX_VALUES, { message: 'Select a gender.' }),
  paymentType: z.enum(PATIENT_PAYMENT_TYPE_VALUES, {
    message: 'Select a payment type.',
  }),
  bloodGroup: optionalText,
  maritalStatus: optionalText,
  address: optionalText,
  nationality: optionalText,
  occupation: optionalText,
  nextOfKin: nextOfKinSchema,
  isActive: z.boolean(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
