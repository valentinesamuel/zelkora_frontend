/**
 * Client-side validation for the patient create / edit form.
 *
 * STRICT SUBSET MIRROR of the backend binding tags in
 * `zelkora_backend/internal/patient/dto.go` (`CreatePatientRequest`,
 * `UpdatePatientRequest`, `NextOfKinRequest`). The backend is authoritative —
 * never add a rule it does not enforce (no length caps, no phone charset, no
 * DOB / age range). Email + phone uniqueness is a server concern and surfaces as
 * a 409 on submit, not a sync rule here.
 *
 * Observed backend binding tags:
 *   firstName, lastName, phoneNumber, dateOfBirth, gender, paymentType   required
 *   email                                                 omitempty,email
 *   middleName, bloodGroup, maritalStatus, address, nationality, occupation  (none)
 *   nextOfKin.{name,phone,relationship,address}            required
 *   dateOfBirth is time.Parse("2006-01-02", …) → 400 unless YYYY-MM-DD
 *
 * `isActive` is create-irrelevant (server defaults it true) — the create flow
 * simply never renders the control or sends the field; keeping it in one schema
 * avoids a second resolver with no behavioural difference.
 */
import { z } from 'zod';

export const GENDER_VALUES = ['male', 'female', 'other'] as const;
export const PAYMENT_TYPE_VALUES = ['hmo', 'cash', 'corporate'] as const;

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
  gender: z.enum(GENDER_VALUES, { message: 'Select a gender.' }),
  paymentType: z.enum(PAYMENT_TYPE_VALUES, {
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
