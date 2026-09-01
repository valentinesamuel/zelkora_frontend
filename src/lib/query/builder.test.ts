import { describe, expect, it } from 'vitest';

import { defineEntityQuery } from './builder';
import { QueryValidationError } from './errors';
import type { EntityQueryMeta } from './types';

// Local fixture, shaped like the Patient entity but never imported from
// `features/patients` — this directory is 100% entity-agnostic.
interface FixtureRow {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly dateOfBirth: string;
  readonly gender: 'male' | 'female' | 'other';
  readonly paymentType: 'hmo' | 'cash' | 'corporate';
  readonly isActive: boolean;
  readonly branchId: string;
  readonly lgaId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

const fixtureMeta = {
  entity: 'fixtures',
  fields: {
    id: { type: 'uuid' },
    firstName: { type: 'text' },
    lastName: { type: 'text' },
    email: { type: 'citext' },
    dateOfBirth: { type: 'date' },
    gender: { type: 'enum', values: ['male', 'female', 'other'] },
    paymentType: { type: 'enum', values: ['hmo', 'cash', 'corporate'] },
    isActive: { type: 'bool' },
    branchId: { type: 'uuid' },
    lgaId: { type: 'uuid' },
    createdAt: { type: 'timestamptz' },
    updatedAt: { type: 'timestamptz' },
    'branch.name': { type: 'text' },
    'lga.name': { type: 'text' },
    'lga.stateId': { type: 'uuid' },
    'nextOfKin.relationship': { type: 'text' },
    'nextOfKin.name': { type: 'text' },
    'nextOfKin.phone': { type: 'text' },
    'nextOfKin.address': { type: 'text' },
  },
  sortFields: ['lastName', 'createdAt'],
  searchFields: ['firstName', 'lastName'],
  relations: ['branch', 'lga', 'lga.state'],
  projectableFields: ['firstName', 'lastName'],
} as const satisfies EntityQueryMeta<FixtureRow>;

const query = defineEntityQuery<FixtureRow, typeof fixtureMeta>(fixtureMeta);

function codeOf(fn: () => unknown): string {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(QueryValidationError);
    return (err as QueryValidationError).code;
  }
  throw new Error('expected fn to throw');
}

describe('all 13 filter operators', () => {
  it('eq / ne / gt / gte / lt / lte on an orderable field', () => {
    const state = query()
      .where('createdAt', 'eq', '2026-01-01T00:00:00Z')
      .where('createdAt', 'ne', '2026-01-01T00:00:00Z')
      .where('createdAt', 'gt', '2026-01-01T00:00:00Z')
      .where('createdAt', 'gte', '2026-01-01T00:00:00Z')
      .where('createdAt', 'lt', '2026-01-01T00:00:00Z')
      .where('createdAt', 'lte', '2026-01-01T00:00:00Z')
      .build();
    expect(state.filters.map((f) => f.op)).toEqual([
      'eq',
      'ne',
      'gt',
      'gte',
      'lt',
      'lte',
    ]);
  });

  it('like / ilike on a text field', () => {
    const state = query()
      .where('firstName', 'like', 'john')
      .where('firstName', 'ilike', 'JOHN')
      .build();
    expect(state.filters).toEqual([
      { field: 'firstName', op: 'like', value: 'john' },
      { field: 'firstName', op: 'ilike', value: 'JOHN' },
    ]);
  });

  it('in / nin via whereIn', () => {
    const state = query()
      .whereIn('firstName', 'in', ['John', 'Jane'])
      .whereIn('firstName', 'nin', ['Bob'])
      .build();
    expect(state.filters[0]).toEqual({
      field: 'firstName',
      op: 'in',
      value: ['John', 'Jane'],
    });
    expect(state.filters[1]).toEqual({
      field: 'firstName',
      op: 'nin',
      value: ['Bob'],
    });
  });

  it('between via whereBetween', () => {
    const state = query()
      .whereBetween('createdAt', ['2026-01-01', '2026-12-31'])
      .build();
    expect(state.filters[0]).toEqual({
      field: 'createdAt',
      op: 'between',
      value: ['2026-01-01', '2026-12-31'],
    });
  });

  it('isNull / notNull carry no value', () => {
    const state = query()
      .where('email', 'isNull')
      .where('email', 'notNull')
      .build();
    expect(state.filters).toEqual([
      { field: 'email', op: 'isNull', value: undefined },
      { field: 'email', op: 'notNull', value: undefined },
    ]);
  });
});

describe('dot-notation relation filters', () => {
  it('accepts branch.name, lga.name, lga.stateId', () => {
    const state = query()
      .where('branch.name', 'eq', 'Ikeja')
      .where('lga.name', 'ilike', 'iked')
      .where('lga.stateId', 'eq', 'a-uuid')
      .build();
    expect(state.filters.map((f) => f.field)).toEqual([
      'branch.name',
      'lga.name',
      'lga.stateId',
    ]);
  });
});

describe('jsonb sub-key filters', () => {
  it('accepts nextOfKin.relationship / .name / .phone / .address', () => {
    const state = query()
      .where('nextOfKin.relationship', 'eq', 'mother')
      .where('nextOfKin.name', 'ilike', 'ada')
      .where('nextOfKin.phone', 'eq', '08000000000')
      .where('nextOfKin.address', 'ilike', 'lagos')
      .build();
    expect(state.filters).toHaveLength(4);
  });
});

describe('search', () => {
  it('supports all 3 modes', () => {
    const state = query()
      .search('firstName', 'ilike', 'john')
      .search('firstName', 'fts', 'john')
      .search('firstName', 'tri', 'john')
      .build();
    expect(state.searches.map((s) => s.mode)).toEqual(['ilike', 'fts', 'tri']);
  });

  it('two search fields OR together (two clauses)', () => {
    const state = query()
      .search('firstName', 'ilike', 'ada')
      .search('lastName', 'ilike', 'ada')
      .build();
    expect(state.searches).toEqual([
      { field: 'firstName', mode: 'ilike', term: 'ada' },
      { field: 'lastName', mode: 'ilike', term: 'ada' },
    ]);
  });

  it('rejects a non-searchable field', () => {
    const widened = query() as unknown as {
      search(field: string, mode: string, term: string): { build(): unknown };
    };
    const code = codeOf(() => widened.search('email', 'ilike', 'x').build());
    expect(code).toBe('invalid_search_field');
  });

  it('rejects a term over 200 chars', () => {
    expect(() =>
      query().search('firstName', 'ilike', 'a'.repeat(200)).build(),
    ).not.toThrow();
    const code = codeOf(() =>
      query().search('firstName', 'ilike', 'a'.repeat(201)).build(),
    );
    expect(code).toBe('search_term_too_long');
  });
});

describe('sort', () => {
  it('accepts createdAt, -createdAt (desc), and multi-column sort', () => {
    expect(query().sort('createdAt').build().sort).toEqual([
      { field: 'createdAt', direction: 'asc' },
    ]);
    expect(query().sort('createdAt', 'desc').build().sort).toEqual([
      { field: 'createdAt', direction: 'desc' },
    ]);
    expect(
      query().sort('lastName').sort('createdAt', 'desc').build().sort,
    ).toEqual([
      { field: 'lastName', direction: 'asc' },
      { field: 'createdAt', direction: 'desc' },
    ]);
  });

  it('rejects a non-whitelisted sort field via a widened call', () => {
    const widened = query() as unknown as {
      sort(field: string): { build(): unknown };
    };
    const code = codeOf(() => widened.sort('id').build());
    expect(code).toBe('invalid_sort_field');
  });
});

describe('projection', () => {
  it('accumulates selected fields', () => {
    const state = query().select('firstName').select('lastName').build();
    expect(state.select).toEqual(['firstName', 'lastName']);
  });
});

describe('includes', () => {
  it('accepts branch, lga, lga.state', () => {
    const state = query()
      .include('branch')
      .include('lga')
      .include('lga.state')
      .build();
    expect(state.includes).toEqual(['branch', 'lga', 'lga.state']);
  });

  it('rejects a non-whitelisted relation via a widened call', () => {
    const widened = query() as unknown as {
      include(relation: string): { build(): unknown };
    };
    const code = codeOf(() => widened.include('ward').build());
    expect(code).toBe('invalid_include');
  });
});

describe('pagination', () => {
  it('cursor mode: limit + cursor', () => {
    const state = query().limit(10).cursor('abc').build();
    expect(state.pagination).toEqual({
      mode: 'cursor',
      limit: 10,
      cursor: 'abc',
    });
  });

  it('offset mode: page + pageSize', () => {
    const state = query().offset(2, 20).build();
    expect(state.pagination).toEqual({
      mode: 'offset',
      page: 2,
      pageSize: 20,
    });
  });

  it('rejects mixing cursor-mode and offset-mode params', () => {
    const code = codeOf(() => query().limit(10).offset(1, 10).build());
    expect(code).toBe('pagination_mode_conflict');
  });
});

describe('withTotal / withDeleted', () => {
  it('default to false, settable to true', () => {
    expect(query().build().withTotal).toBe(false);
    expect(query().build().withDeleted).toBe(false);
    expect(query().withTotal().build().withTotal).toBe(true);
    expect(query().withDeleted().build().withDeleted).toBe(true);
  });
});

describe('runtime limits at both boundaries', () => {
  it('limit: 50 ok, 51 throws', () => {
    expect(() => query().limit(50).build()).not.toThrow();
    expect(codeOf(() => query().limit(51).build())).toBe('limit_out_of_range');
  });

  it('in: 100 items ok, 101 throws', () => {
    const items100 = Array.from({ length: 100 }, (_, i) => `v${i}`);
    const items101 = Array.from({ length: 101 }, (_, i) => `v${i}`);
    expect(() =>
      query().whereIn('firstName', 'in', items100).build(),
    ).not.toThrow();
    expect(
      codeOf(() => query().whereIn('firstName', 'in', items101).build()),
    ).toBe('list_arity');
  });

  it('in: 0 items throws', () => {
    expect(codeOf(() => query().whereIn('firstName', 'in', []).build())).toBe(
      'list_arity',
    );
  });

  it('filter value: 500 chars ok, 501 throws', () => {
    expect(() =>
      query().where('firstName', 'eq', 'a'.repeat(500)).build(),
    ).not.toThrow();
    expect(
      codeOf(() => query().where('firstName', 'eq', 'a'.repeat(501)).build()),
    ).toBe('filter_value_too_long');
  });

  it('cursor: 1000 chars ok, 1001 throws', () => {
    expect(() => query().cursor('a'.repeat(1000)).build()).not.toThrow();
    expect(codeOf(() => query().cursor('a'.repeat(1001)).build())).toBe(
      'cursor_too_long',
    );
  });

  it('page * pageSize: 10000 ok, 10001 throws', () => {
    expect(() => query().offset(200, 50).build()).not.toThrow();
    expect(codeOf(() => query().offset(201, 50).build())).toBe(
      'page_size_product_exceeded',
    );
  });

  it('pageSize: 1 and 50 ok, 0 and 51 throw', () => {
    expect(() => query().offset(1, 1).build()).not.toThrow();
    expect(() => query().offset(1, 50).build()).not.toThrow();
    expect(codeOf(() => query().offset(1, 0).build())).toBe(
      'page_size_out_of_range',
    );
    expect(codeOf(() => query().offset(1, 51).build())).toBe(
      'page_size_out_of_range',
    );
  });

  it('page: >= 1 ok, 0 throws', () => {
    expect(() => query().offset(1, 10).build()).not.toThrow();
    expect(codeOf(() => query().offset(0, 10).build())).toBe(
      'page_out_of_range',
    );
  });

  it('between: exactly 2 values required', () => {
    const widened = query() as unknown as {
      whereBetween(
        field: string,
        values: readonly string[],
      ): {
        build(): unknown;
      };
    };
    expect(
      codeOf(() => widened.whereBetween('createdAt', ['2026-01-01']).build()),
    ).toBe('between_arity');
  });
});

describe('immutability', () => {
  it('mutators never mutate the receiver', () => {
    const base = query().where('firstName', 'eq', 'a');
    const derivedA = base.where('lastName', 'eq', 'b');
    const derivedB = base.where('lastName', 'eq', 'c');

    expect(base.build().filters).toEqual([
      { field: 'firstName', op: 'eq', value: 'a' },
    ]);
    expect(derivedA.build().filters).not.toEqual(derivedB.build().filters);
    expect(derivedA.build()).not.toBe(derivedB.build());
  });
});
