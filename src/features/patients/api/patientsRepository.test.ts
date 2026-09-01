import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiRequest } from '@/lib/apiClient';
import { isCursorResult, isOffsetResult } from '@/lib/query';

import { patientQuery } from '@/features/patients/api/patient.queryMeta';
import { patientsRepository } from '@/features/patients/api/patientsRepository';
import type { Patient } from '@/features/patients/types/patient.types';

vi.mock('@/lib/apiClient', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/apiClient')>('@/lib/apiClient');
  return { ...actual, apiRequest: vi.fn() };
});

const apiRequestMock = vi.mocked(apiRequest);

function patientRow(id: string): Patient {
  return {
    id,
    zrn: `ZRN-LAG-${id}`,
    firstName: 'Ada',
    lastName: 'Okoro',
    phoneNumber: '08030000000',
    dateOfBirth: '1990-01-01',
    gender: 'female',
    paymentType: 'cash',
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

beforeEach(() => {
  apiRequestMock.mockReset();
});

describe('patientsRepository.list', () => {
  it('requests the exact URL for a representative cursor query', async () => {
    apiRequestMock.mockResolvedValue({ data: [] });

    const state = patientQuery()
      .where('isActive', 'eq', true)
      .sort('createdAt', 'desc')
      .limit(25)
      .build();

    await patientsRepository.list(state);

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/patients?filter%5BisActive%5D%5Beq%5D=true&sort=-createdAt&limit=25&paginationMode=cursor',
    );
  });

  it('parses a cursor-mode response into a tagged CursorResult', async () => {
    const row = patientRow('1');
    apiRequestMock.mockResolvedValue({
      data: [row],
      nextCursor: 'opaque-cursor',
      total: 42,
    });

    const state = patientQuery().limit(25).withTotal(true).build();
    const result = await patientsRepository.list(state);

    expect(result.mode).toBe('cursor');
    expect(isCursorResult(result)).toBe(true);
    if (isCursorResult(result)) {
      expect(result.data).toEqual([row]);
      expect(result.nextCursor).toBe('opaque-cursor');
      expect(result.total).toBe(42);
    }
  });

  it('parses an offset-mode response into a tagged OffsetResult', async () => {
    const row = patientRow('1');
    apiRequestMock.mockResolvedValue({
      data: [row],
      page: 2,
      pageSize: 25,
      total: 60,
    });

    const state = patientQuery().offset(2, 25).build();
    const result = await patientsRepository.list(state);

    expect(result.mode).toBe('offset');
    expect(isOffsetResult(result)).toBe(true);
    if (isOffsetResult(result)) {
      expect(result.data).toEqual([row]);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(25);
      expect(result.total).toBe(60);
    }
  });

  it('normalises an absent nextCursor key to null', async () => {
    apiRequestMock.mockResolvedValue({ data: [] });

    const state = patientQuery().limit(25).build();
    const result = await patientsRepository.list(state);

    expect(isCursorResult(result)).toBe(true);
    if (isCursorResult(result)) {
      expect(result.nextCursor).toBeNull();
    }
  });

  it('normalises an explicit null nextCursor to null', async () => {
    apiRequestMock.mockResolvedValue({ data: [], nextCursor: null });

    const state = patientQuery().limit(25).build();
    const result = await patientsRepository.list(state);

    expect(isCursorResult(result)).toBe(true);
    if (isCursorResult(result)) {
      expect(result.nextCursor).toBeNull();
    }
  });

  it('propagates an ApiError from apiClient unchanged', async () => {
    const apiError = new ApiError(404, 'not found', [], 'req-1');
    apiRequestMock.mockRejectedValue(apiError);

    const state = patientQuery().build();

    await expect(patientsRepository.list(state)).rejects.toBe(apiError);
  });
});

describe('patientsRepository.get', () => {
  it('requests /patients/:id and returns the raw patient', async () => {
    const row = patientRow('7');
    apiRequestMock.mockResolvedValue(row);

    const result = await patientsRepository.get('7');

    expect(apiRequestMock).toHaveBeenCalledWith('/patients/7');
    expect(result).toEqual(row);
  });

  it('propagates an ApiError from apiClient unchanged', async () => {
    const apiError = new ApiError(404, 'not found', [], 'req-2');
    apiRequestMock.mockRejectedValue(apiError);

    await expect(patientsRepository.get('missing')).rejects.toBe(apiError);
  });
});
