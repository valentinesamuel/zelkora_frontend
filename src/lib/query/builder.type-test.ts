 

import { describe, expect, expectTypeOf, test } from 'vitest';

import { defineEntityQuery, type QueryBuilder } from './builder';
import type { EntityQueryMeta } from './types';

const COLUMN_TYPE_TEXT = 'text';
const COLUMN_TYPE_UUID = 'uuid';
const COLUMN_TYPE_DATE = 'date';
const COLUMN_TYPE_BOOL = 'bool';
const COLUMN_TYPE_ENUM = 'enum';

interface FixtureRow {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string;
  readonly gender: 'male' | 'female' | 'other';
  readonly isActive: boolean;
  readonly branchId: string;
}

const fixtureMeta = {
  entity: 'fixtures',
  fields: {
    id: { type: COLUMN_TYPE_UUID },
    firstName: { type: COLUMN_TYPE_TEXT },
    lastName: { type: COLUMN_TYPE_TEXT },
    dateOfBirth: { type: COLUMN_TYPE_DATE },
    gender: { type: COLUMN_TYPE_ENUM, values: ['male', 'female', 'other'] },
    isActive: { type: COLUMN_TYPE_BOOL },
    branchId: { type: COLUMN_TYPE_UUID },
  },
  sortFields: ['lastName', 'dateOfBirth'],
  searchFields: ['firstName', 'lastName'],
  relations: ['branch', 'lga', 'lga.state'],
  projectableFields: ['firstName', 'lastName'],
} as const satisfies EntityQueryMeta<FixtureRow>;

type FixtureMeta = typeof fixtureMeta;

const createQuery = defineEntityQuery<FixtureRow, FixtureMeta>(fixtureMeta);

describe('QueryBuilder typing', () => {
  test('must-compile cases', () => {
    expectTypeOf(
      createQuery().where('firstName', 'ilike', 'john'),
    ).toEqualTypeOf<QueryBuilder<FixtureRow, FixtureMeta>>();

    expectTypeOf(createQuery().where('isActive', 'eq', true)).toEqualTypeOf<
      QueryBuilder<FixtureRow, FixtureMeta>
    >();

    expectTypeOf(
      createQuery().where('dateOfBirth', 'gte', '1990-01-01'),
    ).toEqualTypeOf<QueryBuilder<FixtureRow, FixtureMeta>>();

    expectTypeOf(createQuery().include('branch')).toEqualTypeOf<
      QueryBuilder<FixtureRow, FixtureMeta>
    >();

    expectTypeOf(createQuery().include('lga.state')).toEqualTypeOf<
      QueryBuilder<FixtureRow, FixtureMeta>
    >();
  });

  test('must-fail cases', () => {
    const q = createQuery();
    
    expect(q).toBeDefined();

    // @ts-expect-error -- 'gte' is not in the bool operator subset.
    q.where('isActive', 'gte', true);

    // @ts-expect-error -- a date field's value must be a string, not a number.
    q.where('dateOfBirth', 'gte', 1990);

    // @ts-expect-error -- 'age' is not a field on the fixture entity.
    q.where('age', 'eq', '30');

    // @ts-expect-error -- 'ward' is not a whitelisted relation.
    q.include('ward');

    // @ts-expect-error -- 'email' is not a projectable field on the fixture.
    q.select('email');
  });
});
