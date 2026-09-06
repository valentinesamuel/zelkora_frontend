// R-1 drift tripwire: `patient.queryMeta.ts` is hand-authored and nothing
// mechanically ties it to `zelkora_backend/internal/patient/queryconfig.go`.
// These count assertions are the primary defence against silent drift — if
// the backend's Allowed* lists ever change, this file must be updated (and
// re-verified against `queryconfig.go`) in lockstep, or these tests fail.

import { describe, expect, it } from 'vitest';

import { patientQueryMeta } from './patient.queryMeta';

import {
  PATIENT_PAYMENT_TYPE_VALUES,
  PATIENT_SEX_VALUES,
} from '@/features/patients/types/patient.types';

const EXPECTED_FILTER_COUNT = 24;
const EXPECTED_SORT_COUNT = 6;
const EXPECTED_SEARCH_COUNT = 4;
const EXPECTED_RELATION_COUNT = 3;

describe('patientQueryMeta drift tripwire', () => {
  it('resolves the entity name to the exact patientcols.PatientEntityName value', () => {
    expect(patientQueryMeta.entity).toBe('Patient');
  });

  it('exposes exactly 24 filterable fields (AllowedFilters, queryconfig.go:26-52)', () => {
    expect(Object.keys(patientQueryMeta.fields)).toHaveLength(
      EXPECTED_FILTER_COUNT,
    );
  });

  it('exposes exactly 6 sort fields (AllowedSort, queryconfig.go:60-67)', () => {
    expect(patientQueryMeta.sortFields).toHaveLength(EXPECTED_SORT_COUNT);
  });

  it('exposes exactly 4 search fields (AllowedSearch, queryconfig.go:69-73)', () => {
    expect(patientQueryMeta.searchFields).toHaveLength(EXPECTED_SEARCH_COUNT);
  });

  it('exposes exactly 3 relations (AllowedRelations, queryconfig.go:78-82)', () => {
    expect(patientQueryMeta.relations).toHaveLength(EXPECTED_RELATION_COUNT);
  });

  it('never allows patientHmo as a relation (INV-B6)', () => {
    expect(patientQueryMeta.relations).not.toContain('patientHmo');
  });

  it('imports the gender values array from patient.types.ts rather than re-declaring it (INV-D2)', () => {
    expect(patientQueryMeta.fields.gender.values).toBe(PATIENT_SEX_VALUES);
  });

  it('imports the paymentType values array from patient.types.ts rather than re-declaring it (INV-D2)', () => {
    expect(patientQueryMeta.fields.paymentType.values).toBe(
      PATIENT_PAYMENT_TYPE_VALUES,
    );
  });
});
