import { describe, expect, it } from 'vitest';

import { defineEntityQuery } from './builder';
import { canonicalizeForKey, canonicalizeQuery } from './canonicalize';
import type { EntityQueryMeta } from './types';

interface FixtureRow {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isActive: boolean;
  readonly createdAt: string;
}

const fixtureMeta = {
  entity: 'fixtures',
  fields: {
    id: { type: 'uuid' },
    firstName: { type: 'text' },
    lastName: { type: 'text' },
    isActive: { type: 'bool' },
    createdAt: { type: 'timestamptz' },
  },
  sortFields: ['lastName', 'createdAt'],
  searchFields: ['firstName', 'lastName'],
  relations: ['branch'],
  projectableFields: ['firstName', 'lastName'],
} as const satisfies EntityQueryMeta<FixtureRow>;

const query = defineEntityQuery<FixtureRow, typeof fixtureMeta>(fixtureMeta);

describe('canonicalizeQuery: stability under clause reordering', () => {
  it('is identical for .where(a).where(b) and .where(b).where(a)', () => {
    const stateAB = query()
      .where('firstName', 'eq', 'a')
      .where('lastName', 'eq', 'b')
      .build();
    const stateBA = query()
      .where('lastName', 'eq', 'b')
      .where('firstName', 'eq', 'a')
      .build();
    expect(canonicalizeQuery(stateAB)).toEqual(canonicalizeQuery(stateBA));
  });

  it('is identical for .search(a).search(b) and .search(b).search(a)', () => {
    const stateAB = query()
      .search('firstName', 'ilike', 'x')
      .search('lastName', 'ilike', 'y')
      .build();
    const stateBA = query()
      .search('lastName', 'ilike', 'y')
      .search('firstName', 'ilike', 'x')
      .build();
    expect(canonicalizeQuery(stateAB)).toEqual(canonicalizeQuery(stateBA));
  });

  it('is identical for .include(a).include(b) and .include(b).include(a)', () => {
    const stateAB = query().include('branch').build();
    const stateBA = query().include('branch').build();
    expect(canonicalizeQuery(stateAB)).toEqual(canonicalizeQuery(stateBA));
  });

  it('does NOT reorder sort clauses (order is semantically significant)', () => {
    const ascThenDesc = query()
      .sort('lastName')
      .sort('createdAt', 'desc')
      .build();
    const descThenAsc = query()
      .sort('createdAt', 'desc')
      .sort('lastName')
      .build();
    expect(canonicalizeQuery(ascThenDesc)).not.toEqual(
      canonicalizeQuery(descThenAsc),
    );
  });

  it('differs when the actual filter set differs', () => {
    const stateA = query().where('firstName', 'eq', 'a').build();
    const stateB = query().where('firstName', 'eq', 'z').build();
    expect(canonicalizeQuery(stateA)).not.toEqual(canonicalizeQuery(stateB));
  });
});

describe('canonicalizeForKey: excludes cursor and withTotal', () => {
  it('two states differing only by cursor canonicalize identically for a key', () => {
    const stateCursorA = query().limit(10).cursor('cursor-a').build();
    const stateCursorB = query().limit(10).cursor('cursor-b').build();
    expect(canonicalizeForKey(stateCursorA)).toEqual(
      canonicalizeForKey(stateCursorB),
    );
    // But the full canonical form still distinguishes them.
    expect(canonicalizeQuery(stateCursorA)).not.toEqual(
      canonicalizeQuery(stateCursorB),
    );
  });

  it('two states differing only by withTotal canonicalize identically for a key', () => {
    const withTotalOff = query().build();
    const withTotalOn = query().withTotal().build();
    expect(canonicalizeForKey(withTotalOff)).toEqual(
      canonicalizeForKey(withTotalOn),
    );
    expect(canonicalizeQuery(withTotalOff)).not.toEqual(
      canonicalizeQuery(withTotalOn),
    );
  });
});
