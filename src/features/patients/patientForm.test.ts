import { describe, expect, it } from 'vitest';

import {
  buildCreatePatientBody,
  buildUpdatePatientBody,
  emptyPatientFormValues,
  toPatientFormValues,
} from '@/features/patients/patientForm';
import type { PatientFormValues } from '@/features/patients/schemas/patientForm.schema';
import type { PatientWire } from '@/features/patients/types/patient.types';

function filledValues(
  overrides: Partial<PatientFormValues> = {},
): PatientFormValues {
  return {
    firstName: 'Ada',
    lastName: 'Okoro',
    middleName: '',
    email: '',
    phoneNumber: '08030000000',
    dateOfBirth: '1990-05-01',
    gender: 'female',
    paymentType: 'cash',
    bloodGroup: '',
    maritalStatus: '',
    address: '',
    nationality: '',
    occupation: '',
    nextOfKin: {
      name: 'Ben Okoro',
      phone: '08030000001',
      relationship: 'brother',
      address: '1 Marina, Lagos',
    },
    isActive: true,
    ...overrides,
  };
}

const wire: PatientWire = {
  id: 'p1',
  zrn: 'ZRN-LAG-000001',
  firstName: 'Ada',
  lastName: 'Okoro',
  phoneNumber: '08030000000',
  dateOfBirth: '1990-05-01',
  gender: 'female',
  paymentType: 'cash',
  nextOfKin: {
    name: 'Ben Okoro',
    phone: '08030000001',
    relationship: 'brother',
    address: '1 Marina, Lagos',
  },
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-02T00:00:00Z',
  lgaId: 'lga-123',
};

describe('emptyPatientFormValues', () => {
  it('starts every text field empty, enums unselected, isActive true', () => {
    const v = emptyPatientFormValues();
    expect(v.firstName).toBe('');
    expect(v.gender).toBe('');
    expect(v.paymentType).toBe('');
    expect(v.nextOfKin).toEqual({
      name: '',
      phone: '',
      relationship: '',
      address: '',
    });
    expect(v.isActive).toBe(true);
  });
});

describe('toPatientFormValues', () => {
  it('maps a wire record, coercing absent optionals to empty strings', () => {
    const v = toPatientFormValues({ ...wire, middleName: undefined });
    expect(v.middleName).toBe('');
    expect(v.bloodGroup).toBe('');
    expect(v.firstName).toBe('Ada');
    expect(v.dateOfBirth).toBe('1990-05-01');
    expect(v.gender).toBe('female');
    expect(v.isActive).toBe(true);
  });

  it('never carries lgaId into the form', () => {
    const v = toPatientFormValues(wire);
    expect(v).not.toHaveProperty('lgaId');
  });
});

describe('buildCreatePatientBody', () => {
  it('always sends the required scalars and the full nextOfKin', () => {
    const body = buildCreatePatientBody(filledValues());
    expect(body).toMatchObject({
      firstName: 'Ada',
      lastName: 'Okoro',
      phoneNumber: '08030000000',
      dateOfBirth: '1990-05-01',
      gender: 'female',
      paymentType: 'cash',
      nextOfKin: {
        name: 'Ben Okoro',
        phone: '08030000001',
        relationship: 'brother',
        address: '1 Marina, Lagos',
      },
    });
  });

  it('omits optional keys (and email) when empty', () => {
    const body = buildCreatePatientBody(filledValues());
    for (const key of [
      'middleName',
      'email',
      'bloodGroup',
      'maritalStatus',
      'address',
      'nationality',
      'occupation',
    ]) {
      expect(body).not.toHaveProperty(key);
    }
  });

  it('includes and trims optional values that are present', () => {
    const body = buildCreatePatientBody(
      filledValues({ middleName: '  Ngozi  ', email: ' ada@example.com ' }),
    );
    expect(body.middleName).toBe('Ngozi');
    expect(body.email).toBe('ada@example.com');
  });

  it('never emits isActive or lgaId', () => {
    const body = buildCreatePatientBody(filledValues());
    expect(body).not.toHaveProperty('isActive');
    expect(body).not.toHaveProperty('lgaId');
  });
});

describe('buildUpdatePatientBody', () => {
  it('sends only the dirty fields', () => {
    const body = buildUpdatePatientBody(
      filledValues({ firstName: 'Adaeze' }),
      { firstName: true },
    );
    expect(body).toEqual({ firstName: 'Adaeze' });
  });

  it('is empty when nothing is dirty', () => {
    expect(buildUpdatePatientBody(filledValues(), {})).toEqual({});
  });

  it('sends "" (not null) when an optional field is cleared', () => {
    const body = buildUpdatePatientBody(
      filledValues({ occupation: '' }),
      { occupation: true },
    );
    expect(body).toEqual({ occupation: '' });
    expect(body.occupation).not.toBeNull();
  });

  it('sends the whole nextOfKin object when any sub-field is dirty', () => {
    const body = buildUpdatePatientBody(
      filledValues({
        nextOfKin: {
          name: 'Ben Okoro',
          phone: '08099999999',
          relationship: 'brother',
          address: '1 Marina, Lagos',
        },
      }),
      { nextOfKin: { phone: true } },
    );
    expect(body.nextOfKin).toEqual({
      name: 'Ben Okoro',
      phone: '08099999999',
      relationship: 'brother',
      address: '1 Marina, Lagos',
    });
  });

  it('includes isActive only when it is dirty', () => {
    expect(
      buildUpdatePatientBody(filledValues({ isActive: false }), {
        isActive: true,
      }),
    ).toEqual({ isActive: false });

    expect(
      buildUpdatePatientBody(filledValues({ isActive: false }), {}),
    ).toEqual({});
  });

  it('never emits lgaId', () => {
    const body = buildUpdatePatientBody(filledValues({ firstName: 'X' }), {
      firstName: true,
    });
    expect(body).not.toHaveProperty('lgaId');
  });
});
