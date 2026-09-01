// Compile-time-only assertions for `patient.queryMeta.ts`. Run via
// `npm run test:types` (`vitest --typecheck --run`); never picked up by the
// regular `npm test` run (`vitest.config.ts` only includes `src/**/*.test.ts`
// for runtime tests).

import { describe, expect, expectTypeOf, test } from 'vitest';

import type { QueryBuilder } from '@/lib/query';

import { patientQuery, patientQueryMeta } from './patient.queryMeta';

import type { Patient } from '@/features/patients/types/patient.types';

type PatientQueryMeta = typeof patientQueryMeta;

describe('patientQuery typing', () => {
  test('must-compile cases', () => {
    expectTypeOf(
      patientQuery().where('firstName', 'ilike', 'john'),
    ).toEqualTypeOf<QueryBuilder<Patient, PatientQueryMeta>>();

    expectTypeOf(patientQuery().where('isActive', 'eq', true)).toEqualTypeOf<
      QueryBuilder<Patient, PatientQueryMeta>
    >();

    expectTypeOf(
      patientQuery().where('dateOfBirth', 'gte', '1990-01-01'),
    ).toEqualTypeOf<QueryBuilder<Patient, PatientQueryMeta>>();

    expectTypeOf(patientQuery().include('branch')).toEqualTypeOf<
      QueryBuilder<Patient, PatientQueryMeta>
    >();

    expectTypeOf(patientQuery().include('lga.state')).toEqualTypeOf<
      QueryBuilder<Patient, PatientQueryMeta>
    >();
  });

  test('must-fail cases', () => {
    const q = patientQuery();
    // This `expect` only satisfies the "at least one runtime assertion" lint
    // rule — every real assertion in this test is compile-time.
    expect(q).toBeDefined();

    // @ts-expect-error -- wrong operator for a bool field ('ilike' is not in
    // the bool operator subset: eq ne isNull notNull).
    q.where('isActive', 'ilike', 'true');

    // @ts-expect-error -- wrong value type for a date field.
    q.where('dateOfBirth', 'ilike', true);

    // @ts-expect-error -- unknown field, not in AllowedFilters.
    q.where('doesNotExist', 'eq', 'foo');

    // @ts-expect-error -- 'patientHmo' is not in AllowedRelations (it is a
    // OneToMany relation, deliberately excluded per INV-B6).
    q.include('patientHmo');

    // @ts-expect-error -- 'doesNotExist' is not a projectable field on Patient.
    q.select('firstName', 'doesNotExist');
  });
});
