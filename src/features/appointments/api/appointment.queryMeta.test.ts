// R-1 drift tripwire: `appointment.queryMeta.ts` is hand-authored and nothing
// mechanically ties it to
// `zelkora_backend/internal/appointment/queryconfig.go`. These count assertions
// are the primary defence against silent drift — if the backend's Allowed*
// lists ever change, this file must be updated (and re-verified against
// `queryconfig.go`) in lockstep, or these tests fail.

import { describe, expect, it } from 'vitest';

import { appointmentQueryMeta } from './appointment.queryMeta';

import {
  APPOINTMENT_STATUS_VALUES,
  APPOINTMENT_TYPE_VALUES,
} from '@/features/appointments/types/appointment.types';

const EXPECTED_FILTER_COUNT = 10;
const EXPECTED_SORT_COUNT = 4;
const EXPECTED_RELATION_COUNT = 3;

describe('appointmentQueryMeta drift tripwire', () => {
  it('resolves the entity name to the exact appointmentcols.AppointmentEntityName value', () => {
    expect(appointmentQueryMeta.entity).toBe('Appointment');
  });

  it('exposes exactly 10 filterable fields (AllowedFilters, queryconfig.go:31-42)', () => {
    expect(Object.keys(appointmentQueryMeta.fields)).toHaveLength(
      EXPECTED_FILTER_COUNT,
    );
  });

  it('exposes exactly 4 sort fields (AllowedSort, queryconfig.go:44-49)', () => {
    expect(appointmentQueryMeta.sortFields).toHaveLength(EXPECTED_SORT_COUNT);
  });

  it('exposes no search fields (AllowedSearch is nil, queryconfig.go:54)', () => {
    expect(appointmentQueryMeta.searchFields).toHaveLength(0);
  });

  it('exposes exactly 3 relations (AllowedRelations, queryconfig.go:59-63)', () => {
    expect(appointmentQueryMeta.relations).toHaveLength(
      EXPECTED_RELATION_COUNT,
    );
    expect([...appointmentQueryMeta.relations].sort()).toEqual([
      'branch',
      'patient',
      'staff',
    ]);
  });

  it('never allows a OneToMany relation path (patient.patientHmo)', () => {
    expect(appointmentQueryMeta.relations).not.toContain('patient.patientHmo');
  });

  it('keeps branchId filterable so the handler-forced tenant filter validates (INV-2)', () => {
    expect(appointmentQueryMeta.fields.branchId).toBeDefined();
  });

  it('keeps deletedAt filterable so withDeleted=true stays legal (INV-1)', () => {
    expect(appointmentQueryMeta.fields.deletedAt).toBeDefined();
  });

  it('imports the status values array from appointment.types.ts rather than re-declaring it (INV-D2)', () => {
    expect(appointmentQueryMeta.fields.status.values).toBe(
      APPOINTMENT_STATUS_VALUES,
    );
  });

  it('imports the type values array from appointment.types.ts rather than re-declaring it (INV-D2)', () => {
    expect(appointmentQueryMeta.fields.type.values).toBe(
      APPOINTMENT_TYPE_VALUES,
    );
  });
});
