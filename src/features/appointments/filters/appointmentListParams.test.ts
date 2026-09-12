import { describe, expect, it } from 'vitest';

import {
  clearAppointmentFilters,
  countActiveFilters,
  DEFAULT_APPOINTMENT_LIST_QUERY,
  DEFAULT_LIMIT,
  hasActiveQuery,
  LIMIT_OPTIONS,
  parseAppointmentListParams,
  serializeAppointmentListParams,
} from '@/features/appointments/filters/appointmentListParams';
import type { AppointmentListQuery } from '@/features/appointments/filters/appointmentListParams';

const PATIENT_ID = '3f0d6a1e-1b2c-4d5e-8f90-a1b2c3d4e5f6';
const STAFF_ID = '9a8b7c6d-5e4f-4a3b-9c8d-7e6f5a4b3c2d';

function parse(qs: string): AppointmentListQuery {
  return parseAppointmentListParams(new URLSearchParams(qs));
}

describe('parseAppointmentListParams — defaults & healing', () => {
  it('an empty query string resolves to the full default', () => {
    expect(parse('')).toEqual(DEFAULT_APPOINTMENT_LIST_QUERY);
  });

  it('reads a well-formed query', () => {
    const q = parse(
      `status=CONFIRMED&type=FOLLOW_UP&patientId=${PATIENT_ID}&staffId=${STAFF_ID}` +
        '&startFrom=2026-01-01&startTo=2026-01-31&sort=createdAt&dir=desc&limit=50&page=3',
    );
    expect(q).toEqual({
      status: 'CONFIRMED',
      type: 'FOLLOW_UP',
      patientId: PATIENT_ID,
      staffId: STAFF_ID,
      startFrom: '2026-01-01',
      startTo: '2026-01-31',
      sortField: 'createdAt',
      sortDir: 'desc',
      pageSize: 50,
      page: 3,
    });
  });

  it('heals an unknown status / type / sort / dir to defaults', () => {
    const q = parse('status=purple&type=teleport&sort=height&dir=sideways');
    expect(q.status).toBe('all');
    expect(q.type).toBe('all');
    expect(q.sortField).toBe('startAt');
    expect(q.sortDir).toBe('asc');
  });

  it('drops a non-uuid patientId / staffId rather than sending it', () => {
    expect(parse('patientId=not-a-uuid&staffId=42').patientId).toBeNull();
    expect(parse('patientId=not-a-uuid&staffId=42').staffId).toBeNull();
  });

  it('drops a malformed date bound', () => {
    const q = parse('startFrom=01-01-2026&startTo=tomorrow');
    expect(q.startFrom).toBeNull();
    expect(q.startTo).toBeNull();
  });

  it('swaps an inverted date range', () => {
    const q = parse('startFrom=2026-03-01&startTo=2026-02-01');
    expect(q.startFrom).toBe('2026-02-01');
    expect(q.startTo).toBe('2026-03-01');
  });

  it('heals a non-option limit to the default', () => {
    expect(parse('limit=17').pageSize).toBe(DEFAULT_LIMIT);
    expect(parse('limit=abc').pageSize).toBe(DEFAULT_LIMIT);
  });

  it('offers no limit option above the backend max page size of 50', () => {
    expect(Math.max(...LIMIT_OPTIONS)).toBeLessThanOrEqual(50);
  });

  it('heals a non-positive or non-integer page to 1', () => {
    expect(parse('page=0').page).toBe(1);
    expect(parse('page=-4').page).toBe(1);
    expect(parse('page=2.5').page).toBe(1);
    expect(parse('page=abc').page).toBe(1);
  });

  it('clamps page so `page * pageSize` never exceeds the builder ceiling', () => {
    // 10_000 / 25 = 400 — `QueryBuilder.build()` throws above that.
    expect(parse('page=999999').page).toBe(400);
    expect(parse('page=999999&limit=50').page).toBe(200);
  });
});

describe('serializeAppointmentListParams — round-trip', () => {
  it('omits every default', () => {
    expect(
      serializeAppointmentListParams(DEFAULT_APPOINTMENT_LIST_QUERY),
    ).toEqual({});
  });

  it('round-trips a fully populated query', () => {
    const query: AppointmentListQuery = {
      status: 'CHECKED_IN',
      type: 'PROCEDURE',
      patientId: PATIENT_ID,
      staffId: STAFF_ID,
      startFrom: '2026-01-01',
      startTo: '2026-01-31',
      sortField: 'status',
      sortDir: 'desc',
      pageSize: 10,
      page: 4,
    };

    const qs = new URLSearchParams(
      serializeAppointmentListParams(query),
    ).toString();

    expect(parseAppointmentListParams(new URLSearchParams(qs))).toEqual(query);
  });

  it('round-trips a partially populated query', () => {
    const query: AppointmentListQuery = {
      ...DEFAULT_APPOINTMENT_LIST_QUERY,
      status: 'SCHEDULED',
      startFrom: '2026-05-05',
    };

    const serialized = serializeAppointmentListParams(query);
    expect(serialized).toEqual({
      status: 'SCHEDULED',
      startFrom: '2026-05-05',
    });
    expect(parseAppointmentListParams(new URLSearchParams(serialized))).toEqual(
      query,
    );
  });
});

describe('filter helpers', () => {
  it('counts each active filter once, with the date range as one', () => {
    expect(countActiveFilters(DEFAULT_APPOINTMENT_LIST_QUERY)).toBe(0);
    expect(
      countActiveFilters({
        ...DEFAULT_APPOINTMENT_LIST_QUERY,
        status: 'COMPLETED',
        startFrom: '2026-01-01',
        startTo: '2026-01-31',
      }),
    ).toBe(2);
  });

  it('hasActiveQuery tracks the filter count', () => {
    expect(hasActiveQuery(DEFAULT_APPOINTMENT_LIST_QUERY)).toBe(false);
    expect(
      hasActiveQuery({ ...DEFAULT_APPOINTMENT_LIST_QUERY, type: 'LAB' }),
    ).toBe(true);
  });

  it('clearAppointmentFilters resets filters and the page, keeping sort/pageSize', () => {
    const cleared = clearAppointmentFilters({
      status: 'NO_SHOW',
      type: 'LAB',
      patientId: PATIENT_ID,
      staffId: STAFF_ID,
      startFrom: '2026-01-01',
      startTo: '2026-01-31',
      sortField: 'createdAt',
      sortDir: 'desc',
      pageSize: 50,
      page: 7,
    });

    expect(cleared).toEqual({
      ...DEFAULT_APPOINTMENT_LIST_QUERY,
      sortField: 'createdAt',
      sortDir: 'desc',
      pageSize: 50,
    });
  });
});
