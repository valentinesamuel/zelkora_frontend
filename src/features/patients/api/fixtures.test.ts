import { describe, expect, it } from 'vitest';

import { PATIENT_FIXTURES } from '@/features/patients/api/patients.fixtures';
import { calculateAge } from '@/features/patients/format';
import { fullNameOf } from '@/features/patients/types/patient.types';

const SEXES = new Set(['male', 'female', 'other']);
const PAYMENT_TYPES = new Set(['hmo', 'cash', 'corporate']);

describe('PATIENT_FIXTURES', () => {
  it('has a usefully large dataset', () => {
    expect(PATIENT_FIXTURES.length).toBeGreaterThanOrEqual(40);
  });

  it('has unique ids and ZRNs', () => {
    const ids = new Set(PATIENT_FIXTURES.map((p) => p.id));
    const zrns = new Set(PATIENT_FIXTURES.map((p) => p.zrn));
    expect(ids.size).toBe(PATIENT_FIXTURES.length);
    expect(zrns.size).toBe(PATIENT_FIXTURES.length);
  });

  it('only uses valid enum values', () => {
    for (const p of PATIENT_FIXTURES) {
      expect(SEXES.has(p.gender)).toBe(true);
      expect(PAYMENT_TYPES.has(p.paymentType)).toBe(true);
    }
  });

  it('every record has a complete next of kin', () => {
    for (const p of PATIENT_FIXTURES) {
      expect(p.nextOfKin.name).not.toBe('');
      expect(p.nextOfKin.phone).not.toBe('');
      expect(p.nextOfKin.relationship).not.toBe('');
      expect(p.nextOfKin.address).not.toBe('');
    }
  });

  it('includes the intended edge cases', () => {
    const now = new Date();

    // A newborn (age 0).
    expect(
      PATIENT_FIXTURES.some((p) => calculateAge(p.dateOfBirth, now) === 0),
    ).toBe(true);

    // Someone missing a phone number.
    expect(PATIENT_FIXTURES.some((p) => p.phoneNumber === '')).toBe(true);

    // Someone missing an email.
    expect(PATIENT_FIXTURES.some((p) => p.email === undefined)).toBe(true);

    // At least one inactive patient.
    expect(PATIENT_FIXTURES.some((p) => !p.isActive)).toBe(true);

    // A duplicated full name across two different records.
    const names = PATIENT_FIXTURES.map(fullNameOf);
    expect(new Set(names).size).toBeLessThan(names.length);
  });
});
