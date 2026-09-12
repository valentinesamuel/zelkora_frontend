// Drift tripwire (INV-5 / INV-9, state.md R8): these two arrays are the
// frontend's only copy of the backend's appointment status/type enums. Nothing
// mechanically ties them to the Go constants, so every member is pinned as an
// EXACT string here — a length check alone would let a rename slip through
// silently. If this file fails, re-read the Go constants and update both in
// lockstep; do not "fix" the test by relaxing an assertion.

import { describe, expect, it } from 'vitest';

import {
  APPOINTMENT_STATUS_VALUES,
  APPOINTMENT_TYPE_VALUES,
} from '@/features/appointments/types/appointment.types';

describe('APPOINTMENT_STATUS_VALUES', () => {
  it('matches the backend status constants byte for byte, in order', () => {
    expect(APPOINTMENT_STATUS_VALUES).toEqual([
      'SCHEDULED',
      'CONFIRMED',
      'CHECKED_IN',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
      'RESCHEDULED',
    ]);
  });

  it('has exactly 8 members — no extras, no omissions', () => {
    expect(APPOINTMENT_STATUS_VALUES).toHaveLength(8);
  });

  it('contains no duplicates', () => {
    expect(new Set(APPOINTMENT_STATUS_VALUES).size).toBe(
      APPOINTMENT_STATUS_VALUES.length,
    );
  });

  it('uses SCREAMING_SNAKE_CASE throughout (no camelCase / lowercase drift)', () => {
    for (const value of APPOINTMENT_STATUS_VALUES) {
      expect(value).toMatch(/^[A-Z]+(_[A-Z]+)*$/);
    }
  });

  it('defaults new appointments to the first member, SCHEDULED', () => {
    expect(APPOINTMENT_STATUS_VALUES[0]).toBe('SCHEDULED');
  });
});

describe('APPOINTMENT_TYPE_VALUES', () => {
  it('matches the backend type constants byte for byte, in order', () => {
    expect(APPOINTMENT_TYPE_VALUES).toEqual([
      'CONSULTATION',
      'FOLLOW_UP',
      'PROCEDURE',
      'LAB',
      'VACCINATION',
      'EMERGENCY',
    ]);
  });

  it('has exactly 6 members — no extras, no omissions', () => {
    expect(APPOINTMENT_TYPE_VALUES).toHaveLength(6);
  });

  it('contains no duplicates', () => {
    expect(new Set(APPOINTMENT_TYPE_VALUES).size).toBe(
      APPOINTMENT_TYPE_VALUES.length,
    );
  });

  it('uses SCREAMING_SNAKE_CASE throughout (no camelCase / lowercase drift)', () => {
    for (const value of APPOINTMENT_TYPE_VALUES) {
      expect(value).toMatch(/^[A-Z]+(_[A-Z]+)*$/);
    }
  });
});

describe('status/type namespaces', () => {
  it('shares no member between the status and type enums', () => {
    const statuses = new Set<string>(APPOINTMENT_STATUS_VALUES);
    for (const type of APPOINTMENT_TYPE_VALUES) {
      expect(statuses.has(type)).toBe(false);
    }
  });
});
