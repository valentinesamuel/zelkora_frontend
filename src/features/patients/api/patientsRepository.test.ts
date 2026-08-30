import { describe, expect, it } from 'vitest';

import { fixturePatientsRepository } from '@/features/patients/api/patientsRepository';
import { PATIENT_FIXTURES } from '@/features/patients/api/patients.fixtures';
import { DEFAULT_PATIENT_LIST_QUERY } from '@/features/patients/filters/patientListParams';
import type { PatientListQuery } from '@/features/patients/types/patientListQuery.types';

function query(overrides: Partial<PatientListQuery> = {}): PatientListQuery {
  return { ...DEFAULT_PATIENT_LIST_QUERY, ...overrides };
}

describe('fixturePatientsRepository.list', () => {
  it('returns the first page with a total and forward cursor only', async () => {
    const result = await fixturePatientsRepository.list(query({ limit: 10 }));
    expect(result.patients).toHaveLength(10);
    expect(result.total).toBe(PATIENT_FIXTURES.length);
    expect(result.pageInfo.hasPrev).toBe(false);
    expect(result.pageInfo.prevCursor).toBeNull();
    expect(result.pageInfo.hasNext).toBe(true);
    expect(result.pageInfo.nextCursor).not.toBeNull();
  });

  it('walks forward with nextCursor and back to the first page with prevCursor', async () => {
    const first = await fixturePatientsRepository.list(query({ limit: 10 }));
    const second = await fixturePatientsRepository.list(
      query({ limit: 10, cursor: first.pageInfo.nextCursor }),
    );

    expect(second.pageInfo.hasPrev).toBe(true);
    expect(second.patients[0]!.id).not.toBe(first.patients[0]!.id);

    const back = await fixturePatientsRepository.list(
      query({ limit: 10, cursor: second.pageInfo.prevCursor }),
    );
    expect(back.patients.map((p) => p.id)).toEqual(
      first.patients.map((p) => p.id),
    );
  });

  it('sorts by name ascending and descending', async () => {
    const asc = await fixturePatientsRepository.list(
      query({ limit: 100, sortField: 'name', sortDir: 'asc' }),
    );
    const names = asc.patients.map((p) => p.fullName);
    expect([...names]).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));

    const desc = await fixturePatientsRepository.list(
      query({ limit: 100, sortField: 'name', sortDir: 'desc' }),
    );
    expect(desc.patients[0]!.fullName).toBe(names[names.length - 1]);
  });

  it('filters by search across name, ZRN and phone digits', async () => {
    const byName = await fixturePatientsRepository.list(
      query({ limit: 100, search: 'John Okoro' }),
    );
    expect(byName.patients.length).toBeGreaterThanOrEqual(2);
    expect(byName.patients.every((p) => p.fullName.includes('John Okoro'))).toBe(
      true,
    );

    const byZrn = await fixturePatientsRepository.list(
      query({ limit: 100, search: 'ZRN-LAG-090001' }),
    );
    expect(byZrn.patients).toHaveLength(1);
    expect(byZrn.patients[0]!.zrn).toBe('ZRN-LAG-090001');

    const byPhone = await fixturePatientsRepository.list(
      query({ limit: 100, search: '08031234567' }),
    );
    expect(byPhone.patients.length).toBeGreaterThanOrEqual(1);
  });

  it('filters by status and sex', async () => {
    const inactive = await fixturePatientsRepository.list(
      query({ limit: 100, status: 'inactive' }),
    );
    expect(inactive.patients.length).toBeGreaterThan(0);
    expect(inactive.patients.every((p) => p.status === 'inactive')).toBe(true);

    const female = await fixturePatientsRepository.list(
      query({ limit: 100, sex: 'female' }),
    );
    expect(female.patients.every((p) => p.sex === 'female')).toBe(true);
  });

  it('filters by age range', async () => {
    const kids = await fixturePatientsRepository.list(
      query({ limit: 100, ageMin: 0, ageMax: 5 }),
    );
    expect(kids.patients.length).toBeGreaterThan(0);
    expect(kids.patients.every((p) => p.age !== null && p.age <= 5)).toBe(true);
  });

  it('filters by registered date range', async () => {
    const early2023 = await fixturePatientsRepository.list(
      query({ limit: 100, registeredFrom: '2023-01-01', registeredTo: '2023-01-31' }),
    );
    expect(
      early2023.patients.length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      early2023.patients.every(
        (p) => p.registeredAt >= '2023-01-01' && p.registeredAt <= '2023-01-31T23:59:59Z',
      ),
    ).toBe(true);
  });

  it('returns an empty page (not an error) when nothing matches', async () => {
    const none = await fixturePatientsRepository.list(
      query({ limit: 100, search: 'zzzzz-no-such-patient' }),
    );
    expect(none.patients).toHaveLength(0);
    expect(none.total).toBe(0);
    expect(none.pageInfo.hasNext).toBe(false);
    expect(none.pageInfo.hasPrev).toBe(false);
  });
});
