import type { ColumnType, EntityQueryMeta } from '@/lib/query';
import { defineEntityQuery } from '@/lib/query';

import type { Patient } from '@/features/patients/types/patient.types';
import {
  PATIENT_PAYMENT_TYPE_VALUES,
  PATIENT_SEX_VALUES,
} from '@/features/patients/types/patient.types';

const COLUMN_TYPE_UUID: ColumnType = 'uuid';
const COLUMN_TYPE_TEXT: ColumnType = 'text';
const COLUMN_TYPE_CITEXT: ColumnType = 'citext';
const COLUMN_TYPE_DATE: ColumnType = 'date';
const COLUMN_TYPE_TIMESTAMPTZ: ColumnType = 'timestamptz';
const COLUMN_TYPE_ENUM: ColumnType = 'enum';
const COLUMN_TYPE_BOOL: ColumnType = 'bool';

export const patientQueryMeta = {
  // patientcols.PatientEntityName — see metadata.go:11.
  entity: 'Patient',

  // AllowedFilters (24) — queryconfig.go:26-52.
  fields: {
    id: { type: COLUMN_TYPE_UUID },
    // NO-OP: the handler force-overwrites `filter[branchId]` from the JWT
    // (INV-B1). Kept here only because it IS in the Go AllowedFilters list.
    branchId: { type: COLUMN_TYPE_UUID },
    deletedAt: { type: COLUMN_TYPE_TIMESTAMPTZ },
    firstName: { type: COLUMN_TYPE_TEXT },
    lastName: { type: COLUMN_TYPE_TEXT },
    email: { type: COLUMN_TYPE_CITEXT },
    phoneNumber: { type: COLUMN_TYPE_TEXT },
    // Value sets imported from the Phase 2 unions (F3); never re-declared
    // here (INV-D2).
    gender: { type: COLUMN_TYPE_ENUM, values: PATIENT_SEX_VALUES },
    paymentType: {
      type: COLUMN_TYPE_ENUM,
      values: PATIENT_PAYMENT_TYPE_VALUES,
    },
    maritalStatus: { type: COLUMN_TYPE_TEXT },
    bloodGroup: { type: COLUMN_TYPE_TEXT },
    nationality: { type: COLUMN_TYPE_TEXT },
    isActive: { type: COLUMN_TYPE_BOOL },
    dateOfBirth: { type: COLUMN_TYPE_DATE },
    createdAt: { type: COLUMN_TYPE_TIMESTAMPTZ },
    zrn: { type: COLUMN_TYPE_TEXT },
    lgaId: { type: COLUMN_TYPE_UUID },
    'nextOfKin.relationship': { type: COLUMN_TYPE_TEXT },
    'nextOfKin.name': { type: COLUMN_TYPE_TEXT },
    'nextOfKin.phone': { type: COLUMN_TYPE_TEXT },
    'nextOfKin.address': { type: COLUMN_TYPE_TEXT },
    'branch.name': { type: COLUMN_TYPE_TEXT },
    'lga.name': { type: COLUMN_TYPE_TEXT },
    'lga.stateId': { type: COLUMN_TYPE_UUID },
  },

  // AllowedSort (6) — queryconfig.go:60-67. The backend always appends
  // `id ASC` as the final tiebreaker (INV-Q8): never emit a trailing `id`.
  sortFields: [
    'firstName',
    'lastName',
    'middleName',
    'createdAt',
    'dateOfBirth',
    'id',
  ],

  // AllowedSearch (4) — queryconfig.go:69-73.
  searchFields: ['firstName', 'lastName', 'zrn', 'phoneNumber'],

  // AllowedRelations (3) — queryconfig.go:78-82. `patientHmo` is a
  // OneToMany relation and is deliberately absent (INV-B6).
  relations: ['branch', 'lga', 'lga.state'],

  // AllowedFields is unrestricted server-side (queryconfig.go:87-90); any
  // root column of `Patient` may be projected.
  projectableFields: [
    'id',
    'zrn',
    'firstName',
    'lastName',
    'middleName',
    'email',
    'phoneNumber',
    'dateOfBirth',
    'gender',
    'bloodGroup',
    'maritalStatus',
    'address',
    'nationality',
    'occupation',
    'paymentType',
    'nextOfKin',
    'lgaId',
    'isActive',
    'createdAt',
    'updatedAt',
  ],
} as const satisfies EntityQueryMeta<Patient>;

export const patientQuery = defineEntityQuery<Patient, typeof patientQueryMeta>(
  patientQueryMeta,
);
