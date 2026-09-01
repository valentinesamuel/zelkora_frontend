import { describe, expect, it } from 'vitest';

import {
  patientAge,
  patientDisplayStatus,
  patientFullName,
  patientInitialsOf,
  patientLastVisitAt,
} from '@/features/patients/patientView';
import type { Patient } from '@/features/patients/types/patient.types';

const NOW = new Date('2026-08-30T12:00:00Z');

function patient(overrides: Partial<Patient> = {}): Patient {
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

describe('patientFullName / patientInitialsOf', () => {
  it('derives the full name from the name parts', () => {
    expect(patientFullName(patient({ middleName: 'Grace' }))).toBe(
      'Ada Grace Okonkwo',
    );
  });

  it('derives initials from first + last', () => {
    expect(patientInitialsOf(patient({ middleName: 'Grace' }))).toBe('AO');
  });
});

describe('patientAge', () => {
  it('reports whole years to the injected now', () => {
    expect(patientAge(patient(), NOW)).toBe(36);
  });

  it('reports null for an unparseable date of birth', () => {
    expect(patientAge(patient({ dateOfBirth: '' }), NOW)).toBeNull();
  });
});

describe('patientDisplayStatus', () => {
  it('maps isActive:true to ACTIVE', () => {
    expect(patientDisplayStatus(patient())).toBe('active');
  });

  it('maps isActive:false to INACTIVE', () => {
    expect(patientDisplayStatus(patient({ isActive: false }))).toBe('inactive');
  });
});

describe('patientLastVisitAt', () => {
  it('is always null — no backend field yet', () => {
    expect(patientLastVisitAt()).toBeNull();
  });
});
