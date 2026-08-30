import type { DefaultValues, FieldNamesMarkedBoolean } from 'react-hook-form';

import type { PatientFormValues } from '@/features/patients/schemas/patientForm.schema';
import type {
  CreatePatientBody,
  Patient,
  UpdatePatientBody,
} from '@/features/patients/types/patient.types';

type PatientDirtyFields = Partial<
  Readonly<FieldNamesMarkedBoolean<PatientFormValues>>
>;

const OPTIONAL_TEXT_FIELDS = [
  'middleName',
  'bloodGroup',
  'maritalStatus',
  'address',
  'nationality',
  'occupation',
] as const;

export function emptyPatientFormValues(): DefaultValues<PatientFormValues> {
  return {
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: undefined,
    paymentType: undefined,
    bloodGroup: '',
    maritalStatus: '',
    address: '',
    nationality: '',
    occupation: '',
    nextOfKin: { name: '', phone: '', relationship: '', address: '' },
    isActive: true,
  };
}

export function toPatientFormValues(wire: Patient): PatientFormValues {
  return {
    firstName: wire.firstName,
    lastName: wire.lastName,
    middleName: wire.middleName ?? '',
    email: wire.email ?? '',
    phoneNumber: wire.phoneNumber,
    dateOfBirth: wire.dateOfBirth,
    gender: wire.gender,
    paymentType: wire.paymentType,
    bloodGroup: wire.bloodGroup ?? '',
    maritalStatus: wire.maritalStatus ?? '',
    address: wire.address ?? '',
    nationality: wire.nationality ?? '',
    occupation: wire.occupation ?? '',
    nextOfKin: {
      name: wire.nextOfKin.name,
      phone: wire.nextOfKin.phone,
      relationship: wire.nextOfKin.relationship,
      address: wire.nextOfKin.address,
    },
    isActive: wire.isActive,
  };
}

export function buildCreatePatientBody(
  values: PatientFormValues,
): CreatePatientBody {
  const body: CreatePatientBody = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    paymentType: values.paymentType,
    nextOfKin: {
      name: values.nextOfKin.name.trim(),
      phone: values.nextOfKin.phone.trim(),
      relationship: values.nextOfKin.relationship.trim(),
      address: values.nextOfKin.address.trim(),
    },
  };

  const email = values.email.trim();
  if (email !== '') body.email = email;

  for (const field of OPTIONAL_TEXT_FIELDS) {
    const value = values[field].trim();
    if (value !== '') body[field] = value;
  }

  return body;
}

export function buildUpdatePatientBody(
  values: PatientFormValues,
  dirtyFields: PatientDirtyFields,
): UpdatePatientBody {
  const body: UpdatePatientBody = {};

  if (dirtyFields.firstName) body.firstName = values.firstName.trim();
  if (dirtyFields.lastName) body.lastName = values.lastName.trim();
  if (dirtyFields.phoneNumber) body.phoneNumber = values.phoneNumber.trim();
  if (dirtyFields.dateOfBirth) body.dateOfBirth = values.dateOfBirth;
  if (dirtyFields.gender) body.gender = values.gender;
  if (dirtyFields.paymentType) body.paymentType = values.paymentType;
  if (dirtyFields.email) body.email = values.email.trim();

  for (const field of OPTIONAL_TEXT_FIELDS) {
    if (dirtyFields[field]) body[field] = values[field].trim();
  }

  const nok = dirtyFields.nextOfKin;
  if (nok && (nok.name || nok.phone || nok.relationship || nok.address)) {
    body.nextOfKin = {
      name: values.nextOfKin.name.trim(),
      phone: values.nextOfKin.phone.trim(),
      relationship: values.nextOfKin.relationship.trim(),
      address: values.nextOfKin.address.trim(),
    };
  }

  if (dirtyFields.isActive) body.isActive = values.isActive;

  return body;
}
