import { describe, expect, it } from 'vitest';

import {
  fullNameOf,
  patientInitials,
  toPatient,
  type PatientWire,
} from '@/features/patients/types/patient.types';

const NOW = new Date('2026-08-30T12:00:00Z');

function wire(overrides: Partial<PatientWire> = {}): PatientWire {
  return {
    id: 'pat-1',
    zrn: 'ZRN-LAG-000001',
    firstName: 'Ada',
    lastName: 'Okonkwo',
    phoneNumber: '08031234567',
    dateOfBirth: '1990-01-01',
    gender: 'female',
    paymentType: 'hmo',
    nextOfKin: { name: 'N', phone: 'p', relationship: 'r', address: 'a' },
    isActive: true,
    createdAt: '2025-05-01T09:30:00Z',
    updatedAt: '2025-05-01T09:30:00Z',
    ...overrides,
  };
}

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
      fullNameOf({ firstName: 'Ada', middleName: 'Grace', lastName: 'Okonkwo' }),
    ).toBe('Ada Grace Okonkwo');
  });

  it('omits an absent middle name', () => {
    expect(
      fullNameOf({ firstName: 'Ada', middleName: undefined, lastName: 'Okonkwo' }),
    ).toBe('Ada Okonkwo');
  });

  it('collapses surrounding whitespace on parts', () => {
    expect(
      fullNameOf({ firstName: ' Ada ', middleName: '  ', lastName: ' Okonkwo ' }),
    ).toBe('Ada Okonkwo');
  });
});

describe('toPatient', () => {
  it('maps identity, age and status from the wire shape', () => {
    const p = toPatient(wire(), NOW);
    expect(p.fullName).toBe('Ada Okonkwo');
    expect(p.initials).toBe('AO');
    expect(p.age).toBe(36);
    expect(p.sex).toBe('female');
    expect(p.status).toBe('active');
    expect(p.registeredAt).toBe('2025-05-01T09:30:00Z');
  });

  it('maps isActive:false to "inactive"', () => {
    expect(toPatient(wire({ isActive: false }), NOW).status).toBe('inactive');
  });

  it('normalises absent / blank email and phone to null', () => {
    const p = toPatient(wire({ email: undefined, phoneNumber: '   ' }), NOW);
    expect(p.email).toBeNull();
    expect(p.phone).toBeNull();
  });

  it('keeps a real email and phone', () => {
    const p = toPatient(
      wire({ email: 'ada@example.test', phoneNumber: '08031234567' }),
      NOW,
    );
    expect(p.email).toBe('ada@example.test');
    expect(p.phone).toBe('08031234567');
  });

  it('always reports lastVisitAt as null (no backend field yet)', () => {
    expect(toPatient(wire(), NOW).lastVisitAt).toBeNull();
  });

  it('reports age null for an unparseable date of birth', () => {
    expect(toPatient(wire({ dateOfBirth: '' }), NOW).age).toBeNull();
  });
});
