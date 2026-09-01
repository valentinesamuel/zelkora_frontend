import { describe, expect, it } from 'vitest';

import { patientQueryKeys } from '@/features/patients/api/patients.keys';
import { DEFAULT_PATIENT_LIST_QUERY } from '@/features/patients/filters/patientListParams';
import {
  dobLowerBoundForMaxAge,
  dobUpperBoundForMinAge,
  toPatientQuery,
} from '@/features/patients/filters/toPatientQuery';
import type { PatientListQuery } from '@/features/patients/types/patientListQuery.types';
import type { FilterClause, SearchClause, SortClause } from '@/lib/query';

// A fixed, boring instant: mid-year, non-leap, so year subtraction is exact.
const NOW = new Date('2025-06-15T12:34:56.000Z');

function ui(patch: Partial<PatientListQuery> = {}): PatientListQuery {
  return { ...DEFAULT_PATIENT_LIST_QUERY, ...patch };
}

function filtersOf(
  patch: Partial<PatientListQuery>,
  now = NOW,
): FilterClause[] {
  return [...toPatientQuery(ui(patch), now).build().filters];
}

function searchesOf(patch: Partial<PatientListQuery>): SearchClause[] {
  return [...toPatientQuery(ui(patch), NOW).build().searches];
}

function sortOf(patch: Partial<PatientListQuery>): SortClause[] {
  return [...toPatientQuery(ui(patch), NOW).build().sort];
}

describe('toPatientQuery — purity & baseline', () => {
  it('the default query emits no filters and no searches', () => {
    const state = toPatientQuery(ui(), NOW).build();
    expect(state.filters).toEqual([]);
    expect(state.searches).toEqual([]);
  });

  it('never emits a cursor (INV-U1: the cursor is not UI state)', () => {
    const state = toPatientQuery(ui({ limit: 50 }), NOW).build();
    expect(state.pagination.cursor).toBeUndefined();
    expect(state.pagination.mode).toBe('cursor');
  });

  it('never emits filter[branchId] (INV-B1)', () => {
    const state = toPatientQuery(
      ui({ search: 'ada', status: 'active', sex: 'female', ageMin: 20 }),
      NOW,
    ).build();
    expect(state.filters.map((f) => f.field)).not.toContain('branchId');
  });

  it('never emits a trailing id sort (INV-Q8)', () => {
    for (const sortField of ['name', 'age', 'registeredAt'] as const) {
      const clauses = sortOf({ sortField });
      expect(clauses).toHaveLength(1);
      expect(clauses.map((s) => s.field)).not.toContain('id');
    }
  });

  it('is pure — the same input twice yields an identical state', () => {
    const input = ui({ search: 'ada', ageMin: 18, ageMax: 65 });
    expect(toPatientQuery(input, NOW).build()).toEqual(
      toPatientQuery(input, NOW).build(),
    );
  });

  it('applies the limit verbatim', () => {
    expect(
      toPatientQuery(ui({ limit: 10 }), NOW).build().pagination.limit,
    ).toBe(10);
  });
});

describe('toPatientQuery — search', () => {
  it('fans a term out across firstName/lastName (trigram) and zrn/phoneNumber (ilike)', () => {
    expect(searchesOf({ search: 'ada' })).toEqual([
      { field: 'firstName', mode: 'tri', term: 'ada' },
      { field: 'lastName', mode: 'tri', term: 'ada' },
      { field: 'zrn', mode: 'ilike', term: 'ada' },
      { field: 'phoneNumber', mode: 'ilike', term: 'ada' },
    ]);
  });

  it('trims the term before searching', () => {
    expect(searchesOf({ search: '  ada  ' })[0]?.term).toBe('ada');
  });

  it('emits nothing for an empty or whitespace-only term', () => {
    expect(searchesOf({ search: '' })).toEqual([]);
    expect(searchesOf({ search: '   ' })).toEqual([]);
  });

  it('clamps an over-long term to 200 chars rather than throwing', () => {
    const term = 'a'.repeat(500);
    const clauses = searchesOf({ search: term });
    expect(clauses).toHaveLength(4);
    expect(clauses[0]?.term).toHaveLength(200);
  });
});

describe('toPatientQuery — status', () => {
  it("'active' maps to isActive = true", () => {
    expect(filtersOf({ status: 'active' })).toEqual([
      { field: 'isActive', op: 'eq', value: true },
    ]);
  });

  it("'inactive' maps to isActive = false", () => {
    expect(filtersOf({ status: 'inactive' })).toEqual([
      { field: 'isActive', op: 'eq', value: false },
    ]);
  });

  it("'all' adds no status filter", () => {
    expect(filtersOf({ status: 'all' })).toEqual([]);
  });
});

describe('toPatientQuery — sex', () => {
  it("'all' adds no gender filter", () => {
    expect(filtersOf({ sex: 'all' })).toEqual([]);
  });

  it.each(['male', 'female', 'other'] as const)(
    "'%s' maps to gender eq",
    (sex) => {
      expect(filtersOf({ sex })).toEqual([
        { field: 'gender', op: 'eq', value: sex },
      ]);
    },
  );
});

describe('toPatientQuery — age -> dateOfBirth (D3)', () => {
  it('ageMin alone becomes dateOfBirth <= now - m years', () => {
    expect(filtersOf({ ageMin: 18 })).toEqual([
      { field: 'dateOfBirth', op: 'lte', value: '2007-06-15' },
    ]);
  });

  it('ageMax alone becomes dateOfBirth >= now - (M+1) years + 1 day', () => {
    expect(filtersOf({ ageMax: 30 })).toEqual([
      { field: 'dateOfBirth', op: 'gte', value: '1994-06-16' },
    ]);
  });

  it('both bounds collapse into a single between, lower then upper', () => {
    expect(filtersOf({ ageMin: 18, ageMax: 30 })).toEqual([
      {
        field: 'dateOfBirth',
        op: 'between',
        value: ['1994-06-16', '2007-06-15'],
      },
    ]);
  });

  it('neither bound adds nothing', () => {
    expect(filtersOf({ ageMin: null, ageMax: null })).toEqual([]);
  });

  it('handles age 0 (an infant) without emitting a falsy-skipped bound', () => {
    expect(filtersOf({ ageMax: 0 })).toEqual([
      { field: 'dateOfBirth', op: 'gte', value: '2024-06-16' },
    ]);
    expect(filtersOf({ ageMin: 0 })).toEqual([
      { field: 'dateOfBirth', op: 'lte', value: '2025-06-15' },
    ]);
  });
});

describe('age boundaries — exact semantics', () => {
  // Someone born exactly on the upper bound has their m-th birthday today.
  it('the ageMin upper bound is the birthday itself (inclusive)', () => {
    expect(dobUpperBoundForMinAge(18, new Date('2025-06-15T00:00:00Z'))).toBe(
      '2007-06-15',
    );
  });

  // Someone born a day earlier than the lower bound is already M+1.
  it('the ageMax lower bound is the day after the (M+1)-th birthday', () => {
    expect(dobLowerBoundForMaxAge(30, new Date('2025-06-15T00:00:00Z'))).toBe(
      '1994-06-16',
    );
  });

  it('is independent of the time of day within `now`', () => {
    expect(dobUpperBoundForMinAge(40, new Date('2025-06-15T23:59:59Z'))).toBe(
      dobUpperBoundForMinAge(40, new Date('2025-06-15T00:00:00Z')),
    );
  });

  it('is independent of the host timezone (evaluated in UTC)', () => {
    // Same instant, two representations.
    expect(dobUpperBoundForMinAge(10, new Date(Date.UTC(2025, 5, 15)))).toBe(
      '2015-06-15',
    );
  });
});

describe('age boundaries — leap days', () => {
  const LEAP_NOW = new Date('2024-02-29T00:00:00Z');

  it('subtracting a year from Feb 29 lands on Mar 1 in a non-leap year', () => {
    // 2023 has no Feb 29: a Feb-29 birthday ages on Mar 1.
    expect(dobUpperBoundForMinAge(1, LEAP_NOW)).toBe('2023-03-01');
  });

  it('subtracting to another leap year keeps Feb 29', () => {
    expect(dobUpperBoundForMinAge(4, LEAP_NOW)).toBe('2020-02-29');
    expect(dobUpperBoundForMinAge(24, LEAP_NOW)).toBe('2000-02-29');
  });

  it('the ageMax lower bound normalises Feb 29 then adds a day', () => {
    // now - 5 years = 2019-02-29 -> 2019-03-01, + 1 day = 2019-03-02.
    expect(dobLowerBoundForMaxAge(4, LEAP_NOW)).toBe('2019-03-02');
    // now - 5 years into a leap year: 2020-02-29 exists, + 1 day = 2020-03-01.
    expect(dobLowerBoundForMaxAge(3, LEAP_NOW)).toBe('2020-03-01');
  });

  it('a Feb-29 range on a leap day produces a well-ordered between', () => {
    const clauses = filtersOf({ ageMin: 1, ageMax: 4 }, LEAP_NOW);
    expect(clauses).toEqual([
      {
        field: 'dateOfBirth',
        op: 'between',
        value: ['2019-03-02', '2023-03-01'],
      },
    ]);
    const [clause] = clauses;
    const bounds = clause?.value as readonly [string, string];
    expect(bounds[0] < bounds[1]).toBe(true);
  });

  it('crossing Feb 29 from Mar 1 is stable', () => {
    expect(dobUpperBoundForMinAge(1, new Date('2024-03-01T00:00:00Z'))).toBe(
      '2023-03-01',
    );
  });
});

describe('toPatientQuery — registered range -> createdAt', () => {
  it('a from bound alone becomes createdAt gte', () => {
    expect(filtersOf({ registeredFrom: '2024-01-01' })).toEqual([
      { field: 'createdAt', op: 'gte', value: '2024-01-01' },
    ]);
  });

  it('a to bound alone becomes createdAt lte', () => {
    expect(filtersOf({ registeredTo: '2024-12-31' })).toEqual([
      { field: 'createdAt', op: 'lte', value: '2024-12-31' },
    ]);
  });

  it('both bounds collapse into a single between', () => {
    expect(
      filtersOf({ registeredFrom: '2024-01-01', registeredTo: '2024-12-31' }),
    ).toEqual([
      {
        field: 'createdAt',
        op: 'between',
        value: ['2024-01-01', '2024-12-31'],
      },
    ]);
  });

  it('neither bound adds nothing', () => {
    expect(filtersOf({ registeredFrom: null, registeredTo: null })).toEqual([]);
  });
});

describe('toPatientQuery — sort mapping (D4)', () => {
  it("'name' maps to firstName, direction unchanged", () => {
    expect(sortOf({ sortField: 'name', sortDir: 'asc' })).toEqual([
      { field: 'firstName', direction: 'asc' },
    ]);
    expect(sortOf({ sortField: 'name', sortDir: 'desc' })).toEqual([
      { field: 'firstName', direction: 'desc' },
    ]);
  });

  it("'registeredAt' maps to createdAt, direction unchanged", () => {
    expect(sortOf({ sortField: 'registeredAt', sortDir: 'asc' })).toEqual([
      { field: 'createdAt', direction: 'asc' },
    ]);
    expect(sortOf({ sortField: 'registeredAt', sortDir: 'desc' })).toEqual([
      { field: 'createdAt', direction: 'desc' },
    ]);
  });

  // The one genuinely counter-intuitive mapping: older == earlier DOB.
  it("'age' maps to dateOfBirth with the direction INVERTED", () => {
    expect(sortOf({ sortField: 'age', sortDir: 'asc' })).toEqual([
      { field: 'dateOfBirth', direction: 'desc' },
    ]);
    expect(sortOf({ sortField: 'age', sortDir: 'desc' })).toEqual([
      { field: 'dateOfBirth', direction: 'asc' },
    ]);
  });
});

describe('toPatientQuery — combined', () => {
  it('composes every clause without interference', () => {
    const state = toPatientQuery(
      ui({
        search: 'ada',
        status: 'active',
        sex: 'female',
        ageMin: 18,
        ageMax: 30,
        registeredFrom: '2024-01-01',
        registeredTo: '2024-12-31',
        sortField: 'age',
        sortDir: 'desc',
        limit: 50,
      }),
      NOW,
    ).build();

    expect(state.searches).toHaveLength(4);
    expect(state.filters).toEqual([
      { field: 'isActive', op: 'eq', value: true },
      { field: 'gender', op: 'eq', value: 'female' },
      {
        field: 'dateOfBirth',
        op: 'between',
        value: ['1994-06-16', '2007-06-15'],
      },
      {
        field: 'createdAt',
        op: 'between',
        value: ['2024-01-01', '2024-12-31'],
      },
    ]);
    expect(state.sort).toEqual([{ field: 'dateOfBirth', direction: 'asc' }]);
    expect(state.pagination.limit).toBe(50);
  });

  it('a change to any UI input changes the built state (drives key reset)', () => {
    const base = ui({ search: 'ada', status: 'active', limit: 25 });
    const baseline = toPatientQuery(base, NOW).build();

    const variants: Partial<PatientListQuery>[] = [
      { search: 'bola' },
      { status: 'inactive' },
      { sex: 'male' },
      { ageMin: 18 },
      { ageMax: 65 },
      { registeredFrom: '2024-01-01' },
      { registeredTo: '2024-12-31' },
      { sortField: 'registeredAt' },
      { sortDir: 'desc' },
      { limit: 50 },
    ];

    for (const patch of variants) {
      const next = toPatientQuery({ ...base, ...patch }, NOW).build();
      expect(next).not.toEqual(baseline);
    }
  });

  // The load-more UX depends on this: nothing in the app explicitly resets the
  // infinite query, so a stale key here would silently keep appending pages of
  // the OLD query under the new filters (INV-B3).
  it('a change to any UI input changes the infinite cache key', () => {
    const base = ui({ search: 'ada', status: 'active', limit: 25 });
    const baselineKey = JSON.stringify(
      patientQueryKeys.infinite(toPatientQuery(base, NOW).build()),
    );

    const variants: Partial<PatientListQuery>[] = [
      { search: 'bola' },
      { status: 'inactive' },
      { sex: 'male' },
      { ageMin: 18 },
      { ageMax: 65 },
      { registeredFrom: '2024-01-01' },
      { registeredTo: '2024-12-31' },
      { sortField: 'registeredAt' },
      { sortDir: 'desc' },
      { limit: 50 },
    ];

    for (const patch of variants) {
      const nextKey = JSON.stringify(
        patientQueryKeys.infinite(
          toPatientQuery({ ...base, ...patch }, NOW).build(),
        ),
      );
      expect(nextKey).not.toBe(baselineKey);
    }
  });

  it('an unchanged UI state keeps the SAME key (no refetch loop)', () => {
    const base = ui({ search: 'ada', ageMin: 18 });
    expect(
      patientQueryKeys.infinite(toPatientQuery(base, NOW).build()),
    ).toEqual(
      patientQueryKeys.infinite(toPatientQuery({ ...base }, NOW).build()),
    );
  });
});
