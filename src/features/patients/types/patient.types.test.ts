import { describe, expect, it } from 'vitest';

import {
  fullNameOf,
  patientInitials,
} from '@/features/patients/types/patient.types';

describe('patientInitials', () => {
  it('takes first + last initial', () => {
    expect(patientInitials('Adebayo Okonkwo')).toBe('AO');
  });

  it('takes a single initial for a one-token name', () => {
    expect(patientInitials('Chidi')).toBe('C');
  });

  it('falls back to "?" for an empty name', () => {
    expect(patientInitials('')).toBe('?');
    expect(patientInitials('   ')).toBe('?');
  });

  it('ignores a middle token and collapses extra whitespace', () => {
    expect(patientInitials('  Ada   Grace   Okonkwo ')).toBe('AO');
  });
});

describe('fullNameOf', () => {
  it('joins first + middle + last', () => {
    expect(
      fullNameOf({
        firstName: 'Ada',
        middleName: 'Grace',
        lastName: 'Okonkwo',
      }),
    ).toBe('Ada Grace Okonkwo');
  });

  it('omits an absent middle name', () => {
    expect(
      fullNameOf({
        firstName: 'Ada',
        middleName: undefined,
        lastName: 'Okonkwo',
      }),
    ).toBe('Ada Okonkwo');
  });

  it('collapses surrounding whitespace on parts', () => {
    expect(
      fullNameOf({
        firstName: ' Ada ',
        middleName: '  ',
        lastName: ' Okonkwo ',
      }),
    ).toBe('Ada Okonkwo');
  });
});
