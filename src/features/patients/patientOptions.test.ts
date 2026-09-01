import { describe, expect, it } from 'vitest';

import {
  BLOOD_GROUP_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NATIONALITY_OPTIONS,
} from '@/features/patients/patientOptions';

describe('patientOptions', () => {
  it('lists the eight canonical blood groups', () => {
    expect(BLOOD_GROUP_OPTIONS.map((o) => o.value)).toEqual([
      'A+',
      'A-',
      'B+',
      'B-',
      'AB+',
      'AB-',
      'O+',
      'O-',
    ]);
    // value === label for these.
    for (const option of BLOOD_GROUP_OPTIONS) {
      expect(option.label).toBe(option.value);
    }
  });

  it('has the standard marital-status set', () => {
    expect(MARITAL_STATUS_OPTIONS.map((o) => o.value)).toEqual([
      'single',
      'married',
      'divorced',
      'widowed',
      'separated',
    ]);
  });

  it('exposes a non-empty, duplicate-free nationality list led by Nigerian', () => {
    expect(NATIONALITY_OPTIONS.length).toBeGreaterThan(50);
    expect(NATIONALITY_OPTIONS[0]?.value).toBe('Nigerian');

    const values = NATIONALITY_OPTIONS.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
