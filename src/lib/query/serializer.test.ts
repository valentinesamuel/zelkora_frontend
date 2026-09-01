import { describe, expect, it } from 'vitest';

import { defineEntityQuery } from './builder';
import { serializeQuery, toQueryString } from './serializer';
import type { EntityQueryMeta } from './types';

interface FixtureRow {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly dateOfBirth: string;
  readonly gender: 'male' | 'female' | 'other';
  readonly isActive: boolean;
  readonly branchId: string;
  readonly lgaId: string;
  readonly createdAt: string;
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
    isActive: { type: 'bool' },
    branchId: { type: 'uuid' },
    lgaId: { type: 'uuid' },
    createdAt: { type: 'timestamptz' },
    'branch.name': { type: 'text' },
    'lga.name': { type: 'text' },
    'lga.stateId': { type: 'uuid' },
  },
  sortFields: ['lastName', 'createdAt'],
  searchFields: ['firstName', 'lastName'],
  relations: ['branch', 'lga', 'lga.state'],
  projectableFields: ['firstName', 'lastName'],
} as const satisfies EntityQueryMeta<FixtureRow>;

const query = defineEntityQuery<FixtureRow, typeof fixtureMeta>(fixtureMeta);

describe('serializeQuery: structural assertions via params.entries()', () => {
  it('matches the documented "expected behaviour" example', () => {
    const state = query()
      .where('firstName', 'ilike', 'jo hn')
      .limit(10)
      .build();
    const params = serializeQuery(state, 'fixtures');
    expect(Array.from(params.entries())).toEqual([
      ['filter[firstName][ilike]', 'jo hn'],
      ['limit', '10'],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes all 13 operators with the correct key/value shape', () => {
    const state = query()
      .where('createdAt', 'eq', '2026-01-01')
      .where('createdAt', 'ne', '2026-01-01')
      .where('createdAt', 'gt', '2026-01-01')
      .where('createdAt', 'gte', '2026-01-01')
      .where('createdAt', 'lt', '2026-01-01')
      .where('createdAt', 'lte', '2026-01-01')
      .where('firstName', 'like', 'jo')
      .where('firstName', 'ilike', 'jo')
      .whereIn('firstName', 'in', ['a', 'b'])
      .whereIn('firstName', 'nin', ['c'])
      .whereBetween('createdAt', ['2026-01-01', '2026-12-31'])
      .where('email', 'isNull')
      .where('email', 'notNull')
      .build();
    const params = serializeQuery(state, 'fixtures');
    expect(Array.from(params.entries())).toEqual([
      ['filter[createdAt][eq]', '2026-01-01'],
      ['filter[createdAt][ne]', '2026-01-01'],
      ['filter[createdAt][gt]', '2026-01-01'],
      ['filter[createdAt][gte]', '2026-01-01'],
      ['filter[createdAt][lt]', '2026-01-01'],
      ['filter[createdAt][lte]', '2026-01-01'],
      ['filter[firstName][like]', 'jo'],
      ['filter[firstName][ilike]', 'jo'],
      ['filter[firstName][in]', 'a,b'],
      ['filter[firstName][nin]', 'c'],
      ['filter[createdAt][between]', '2026-01-01,2026-12-31'],
      ['filter[email][isNull]', ''],
      ['filter[email][notNull]', ''],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes a bool filter as the literal strings true/false', () => {
    const state = query().where('isActive', 'eq', true).build();
    const params = serializeQuery(state, 'fixtures');
    expect(Array.from(params.entries())).toEqual([
      ['filter[isActive][eq]', 'true'],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes dot-notation relation filters', () => {
    const state = query()
      .where('branch.name', 'eq', 'Ikeja')
      .where('lga.stateId', 'eq', 'a-uuid')
      .build();
    expect(Array.from(serializeQuery(state, 'fixtures').entries())).toEqual([
      ['filter[branch.name][eq]', 'Ikeja'],
      ['filter[lga.stateId][eq]', 'a-uuid'],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes all 3 search modes and two OR-ed fields', () => {
    const state = query()
      .search('firstName', 'ilike', 'ada')
      .search('firstName', 'fts', 'ada')
      .search('lastName', 'tri', 'ada')
      .build();
    expect(Array.from(serializeQuery(state, 'fixtures').entries())).toEqual([
      ['search[firstName][ilike]', 'ada'],
      ['search[firstName][fts]', 'ada'],
      ['search[lastName][tri]', 'ada'],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes sort variants: createdAt, -createdAt, lastName,-createdAt', () => {
    expect(
      Array.from(
        serializeQuery(query().sort('createdAt').build(), 'fixtures').entries(),
      ),
    ).toEqual([
      ['sort', 'createdAt'],
      ['paginationMode', 'cursor'],
    ]);
    expect(
      Array.from(
        serializeQuery(
          query().sort('createdAt', 'desc').build(),
          'fixtures',
        ).entries(),
      ),
    ).toEqual([
      ['sort', '-createdAt'],
      ['paginationMode', 'cursor'],
    ]);
    expect(
      Array.from(
        serializeQuery(
          query().sort('lastName').sort('createdAt', 'desc').build(),
          'fixtures',
        ).entries(),
      ),
    ).toEqual([
      ['sort', 'lastName,-createdAt'],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes includes as a single comma-joined param', () => {
    const state = query()
      .include('branch')
      .include('lga')
      .include('lga.state')
      .build();
    expect(Array.from(serializeQuery(state, 'fixtures').entries())).toEqual([
      ['include', 'branch,lga,lga.state'],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes the projection as fields[<entity>]', () => {
    const state = query().select('firstName').select('lastName').build();
    expect(Array.from(serializeQuery(state, 'fixtures').entries())).toEqual([
      ['fields[fixtures]', 'firstName,lastName'],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes cursor pagination', () => {
    const state = query().limit(20).cursor('opaque-cursor').build();
    expect(Array.from(serializeQuery(state, 'fixtures').entries())).toEqual([
      ['limit', '20'],
      ['cursor', 'opaque-cursor'],
      ['paginationMode', 'cursor'],
    ]);
  });

  it('serializes offset pagination', () => {
    const state = query().offset(2, 25).build();
    expect(Array.from(serializeQuery(state, 'fixtures').entries())).toEqual([
      ['page', '2'],
      ['pageSize', '25'],
      ['paginationMode', 'offset'],
    ]);
  });

  it('omits withTotal/withDeleted at their false default, emits when true', () => {
    expect(
      Array.from(serializeQuery(query().build(), 'fixtures').entries()),
    ).toEqual([['paginationMode', 'cursor']]);
    expect(
      Array.from(
        serializeQuery(
          query().withTotal().withDeleted().build(),
          'fixtures',
        ).entries(),
      ),
    ).toEqual([
      ['paginationMode', 'cursor'],
      ['withTotal', 'true'],
      ['withDeleted', 'true'],
    ]);
  });
});

describe('encoding of special characters (raw-string assertions)', () => {
  it('percent-encodes space as + in a filter value', () => {
    const state = query().where('firstName', 'eq', 'jo hn').build();
    expect(toQueryString(state, 'fixtures')).toContain(
      'filter%5BfirstName%5D%5Beq%5D=jo+hn',
    );
  });

  it('percent-encodes &, =, ?, % in a filter value', () => {
    const state = query().where('firstName', 'eq', 'a&b=c?d%e').build();
    const qs = toQueryString(state, 'fixtures');
    expect(qs).toContain('filter%5BfirstName%5D%5Beq%5D=a%26b%3Dc%3Fd%25e');
  });

  it('percent-encodes unicode in a search term', () => {
    const state = query().search('firstName', 'ilike', 'Adaeze — 妈妈').build();
    const qs = toQueryString(state, 'fixtures');
    expect(qs).toContain(
      encodeURIComponent('Adaeze — 妈妈').replace(/%20/g, '+'),
    );
  });

  it('round-trips through URLSearchParams decoding', () => {
    const raw = 'a&b=c?d%e ünïcödé';
    const state = query().where('firstName', 'eq', raw).build();
    const params = serializeQuery(state, 'fixtures');
    expect(params.get('filter[firstName][eq]')).toBe(raw);
  });
});
