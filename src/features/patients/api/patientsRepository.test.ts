import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiRequest } from '@/lib/apiClient';
import { patientsRepository } from '@/features/patients/api/patientsRepository';
import { DEFAULT_PATIENT_LIST_QUERY } from '@/features/patients/filters/patientListParams';
import {
  PatientPaymentTypeEnum,
  PatientSexEnum,
  type ListPatientsResponse,
  type Patient,
} from '@/features/patients/types/patient.types';
import type { PatientListQuery } from '@/features/patients/types/patientListQuery.types';

vi.mock('@/lib/apiClient', () => ({ apiRequest: vi.fn() }));

const apiRequestMock = vi.mocked(apiRequest);

function query(overrides: Partial<PatientListQuery> = {}): PatientListQuery {
  return { ...DEFAULT_PATIENT_LIST_QUERY, ...overrides };
}

function patientRow(id: string): Patient {
  return {
    id,
    zrn: `ZRN-LAG-${id}`,
    firstName: 'Ada',
    lastName: 'Okoro',
    phoneNumber: '08030000000',
    dateOfBirth: '1990-01-01',
    gender: PatientSexEnum.FEMALE,
    paymentType: PatientPaymentTypeEnum.CASH,
    nextOfKin: {
      name: 'Ben',
      phone: '08030000001',
      relationship: 'brother',
      address: 'Lagos',
    },
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };
}

function listResponse(
  overrides: Partial<ListPatientsResponse> = {},
): ListPatientsResponse {
  return {
    patients: [patientRow('1')],
    page: 1,
    limit: 25,
    total: 1,
    ...overrides,
  };
}

beforeEach(() => {
  apiRequestMock.mockReset();
});

describe('patientsRepository.list', () => {
  it('requests page 1 when there is no cursor', async () => {
    apiRequestMock.mockResolvedValue(listResponse());
    await patientsRepository.list(query({ limit: 25 }));
    expect(apiRequestMock).toHaveBeenCalledWith('/patients?page=1&limit=25');
  });

  it('returns the patient rows unchanged from the response', async () => {
    const row = patientRow('1');
    apiRequestMock.mockResolvedValue(
      listResponse({ patients: [row], total: 1 }),
    );
    const result = await patientsRepository.list(query());
    expect(result.patients).toEqual([row]);
    expect(result.total).toBe(1);
  });

  it('exposes a forward cursor only on the first of several pages', async () => {
    apiRequestMock.mockResolvedValue(
      listResponse({ total: 60, limit: 25, patients: [] }),
    );
    const result = await patientsRepository.list(query({ limit: 25 }));
    expect(result.pageInfo.hasPrev).toBe(false);
    expect(result.pageInfo.prevCursor).toBeNull();
    expect(result.pageInfo.hasNext).toBe(true);
    expect(result.pageInfo.nextCursor).not.toBeNull();
  });

  it('round-trips the page number through the opaque cursor', async () => {
    apiRequestMock.mockResolvedValue(listResponse({ total: 60, patients: [] }));
    const first = await patientsRepository.list(query({ limit: 25 }));

    apiRequestMock.mockResolvedValue(
      listResponse({ total: 60, page: 2, patients: [] }),
    );
    await patientsRepository.list(
      query({ limit: 25, cursor: first.pageInfo.nextCursor }),
    );
    expect(apiRequestMock).toHaveBeenLastCalledWith(
      '/patients?page=2&limit=25',
    );
  });

  it('has no next page when page * limit === total', async () => {
    apiRequestMock.mockResolvedValue(
      listResponse({ total: 50, limit: 25, page: 2, patients: [] }),
    );
    const result = await patientsRepository.list(
      query({ limit: 25, cursor: btoa('p:2') }),
    );
    expect(result.pageInfo.hasNext).toBe(false);
    expect(result.pageInfo.nextCursor).toBeNull();
    expect(result.pageInfo.hasPrev).toBe(true);
    expect(result.pageInfo.prevCursor).not.toBeNull();
  });

  it('clamps a malformed cursor back to page 1', async () => {
    apiRequestMock.mockResolvedValue(listResponse());
    await patientsRepository.list(query({ cursor: 'not-base64!!' }));
    expect(apiRequestMock).toHaveBeenCalledWith('/patients?page=1&limit=25');
  });
});
