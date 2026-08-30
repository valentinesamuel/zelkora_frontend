import { describe, expect, it } from 'vitest';

import {
  clearFilters,
  countActiveFilters,
  DEFAULT_LIMIT,
  DEFAULT_PATIENT_LIST_QUERY,
  hasActiveQuery,
  parsePatientListParams,
  resetCursor,
  serializePatientListParams,
} from '@/features/patients/filters/patientListParams';
import type { PatientListQuery } from '@/features/patients/types/patientListQuery.types';

function parse(qs: string): PatientListQuery {
  return parsePatientListParams(new URLSearchParams(qs));
}

describe('parsePatientListParams — defaults & healing', () => {
  it('an empty query string resolves to the full default', () => {
    expect(parse('')).toEqual(DEFAULT_PATIENT_LIST_QUERY);
  });

  it('reads a well-formed query', () => {
    const q = parse(
      'q=ada&status=active&sex=female&ageMin=18&ageMax=65&from=2024-01-01&to=2024-12-31&sort=registeredAt&dir=desc&limit=50&cursor=abc',
    );
    expect(q).toEqual({
      search: 'ada',
      status: 'active',
      sex: 'female',
      ageMin: 18,
      ageMax: 65,
      registeredFrom: '2024-01-01',
      registeredTo: '2024-12-31',
      sortField: 'registeredAt',
      sortDir: 'desc',
      cursor: 'abc',
      limit: 50,
    });
  });

  it('heals an unknown status / sex / sort / dir to defaults', () => {
    const q = parse('status=purple&sex=yes&sort=height&dir=sideways');
    expect(q.status).toBe('all');
    expect(q.sex).toBe('all');
    expect(q.sortField).toBe('name');
    expect(q.sortDir).toBe('asc');
  });

  it('heals a non-option limit to the default', () => {
    expect(parse('limit=17').limit).toBe(DEFAULT_LIMIT);
    expect(parse('limit=abc').limit).toBe(DEFAULT_LIMIT);
  });

  it('drops non-numeric / out-of-range ages', () => {
    expect(parse('ageMin=-3&ageMax=999')).toMatchObject({
      ageMin: null,
      ageMax: null,
    });
    expect(parse('ageMin=1.5').ageMin).toBeNull();
  });

  it('swaps an inverted age range', () => {
    expect(parse('ageMin=80&ageMax=20')).toMatchObject({
      ageMin: 20,
      ageMax: 80,
    });
  });

  it('drops a malformed registered date and swaps an inverted range', () => {
    expect(parse('from=nope').registeredFrom).toBeNull();
    expect(parse('from=2025-12-01&to=2025-01-01')).toMatchObject({
      registeredFrom: '2025-01-01',
      registeredTo: '2025-12-01',
    });
  });

  it('treats an empty cursor as no cursor', () => {
    expect(parse('cursor=').cursor).toBeNull();
  });
});

describe('serializePatientListParams', () => {
  it('omits every key that is still at its default', () => {
    expect(serializePatientListParams(DEFAULT_PATIENT_LIST_QUERY)).toEqual({});
  });

  it('round-trips a non-default query', () => {
    const original = parse(
      'q=john&status=inactive&sex=male&ageMin=5&ageMax=9&from=2023-02-02&to=2023-03-03&sort=registeredAt&dir=desc&limit=10&cursor=xyz',
    );
    const round = parsePatientListParams(
      new URLSearchParams(serializePatientListParams(original)),
    );
    expect(round).toEqual(original);
  });
});

describe('countActiveFilters / hasActiveQuery', () => {
  it('is zero for the default query', () => {
    expect(countActiveFilters(DEFAULT_PATIENT_LIST_QUERY)).toBe(0);
    expect(hasActiveQuery(DEFAULT_PATIENT_LIST_QUERY)).toBe(false);
  });

  it('counts status, sex, an age range and a date range once each', () => {
    const q = parse('status=active&sex=male&ageMin=18&from=2024-01-01');
    expect(countActiveFilters(q)).toBe(4);
  });

  it('does not count search or sort', () => {
    const q = parse('q=ada&sort=registeredAt&dir=desc');
    expect(countActiveFilters(q)).toBe(0);
    expect(hasActiveQuery(q)).toBe(true);
  });
});

describe('resetCursor / clearFilters', () => {
  it('resetCursor clears only the cursor', () => {
    const q = parse('q=ada&status=active&cursor=abc');
    const next = resetCursor(q);
    expect(next.cursor).toBeNull();
    expect(next.search).toBe('ada');
    expect(next.status).toBe('active');
  });

  it('resetCursor returns the same reference when there is no cursor', () => {
    const q = parse('q=ada');
    expect(resetCursor(q)).toBe(q);
  });

  it('clearFilters resets every filter but keeps search, sort and limit', () => {
    const q = parse(
      'q=ada&status=active&sex=male&ageMin=18&from=2024-01-01&sort=registeredAt&dir=desc&limit=50&cursor=abc',
    );
    const next = clearFilters(q);
    expect(next).toMatchObject({
      search: 'ada',
      status: 'all',
      sex: 'all',
      ageMin: null,
      ageMax: null,
      registeredFrom: null,
      registeredTo: null,
      sortField: 'registeredAt',
      sortDir: 'desc',
      limit: 50,
      cursor: null,
    });
  });
});
