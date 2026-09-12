import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiRequest } from '@/lib/apiClient';
import { isOffsetResult } from '@/lib/query';

import { appointmentQuery } from '@/features/appointments/api/appointment.queryMeta';
import { appointmentsRepository } from '@/features/appointments/api/appointmentsRepository';
import type { Appointment } from '@/features/appointments/types/appointment.types';

vi.mock('@/lib/apiClient', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/apiClient')>('@/lib/apiClient');
  return { ...actual, apiRequest: vi.fn() };
});

const apiRequestMock = vi.mocked(apiRequest);

function appointmentRow(id: string): Appointment {
  return {
    id,
    patientId: '837cc3e7-b1e5-4ba5-8566-0650d5e208c0',
    staffId: 'af7126d3-f206-4f2a-861b-9d0108b82712',
    branchId: 'a0359696-51e0-48c0-ba37-4adefe284711',
    status: 'SCHEDULED',
    type: 'CONSULTATION',
    reason: 'Routine check-up',
    startAt: '2026-10-02T09:00:00Z',
    endAt: '2026-10-02T09:30:00Z',
    notes: null,
    createdAt: '2026-09-12T06:53:10Z',
    updatedAt: '2026-09-12T06:53:10Z',
  };
}

beforeEach(() => {
  apiRequestMock.mockReset();
});

describe('appointmentsRepository.list', () => {
  it('requests the exact URL for a representative offset query', async () => {
    apiRequestMock.mockResolvedValue({
      data: [],
      page: 1,
      pageSize: 25,
      total: 0,
    });

    const state = appointmentQuery()
      .where('status', 'eq', 'SCHEDULED')
      .sort('startAt', 'asc')
      .offset(1, 25)
      .build();

    await appointmentsRepository.list(state);

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/appointments?filter%5Bstatus%5D%5Beq%5D=SCHEDULED&sort=startAt&page=1&pageSize=25&paginationMode=offset',
    );
  });

  // `paginationMode` is always serialised, so the bare `/appointments` branch
  // of `buildListPath` is unreachable for any built state — the empty-query
  // case still produces exactly one query param and one `?`.
  it('emits a single "?" separator for a minimal state', async () => {
    apiRequestMock.mockResolvedValue({
      data: [],
      page: 1,
      pageSize: 25,
      total: 0,
    });

    const state = appointmentQuery().offset(1, 25).build();
    await appointmentsRepository.list(state);

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/appointments?page=1&pageSize=25&paginationMode=offset',
    );
  });

  it('parses an offset-mode response into a tagged OffsetResult', async () => {
    const row = appointmentRow('1');
    apiRequestMock.mockResolvedValue({
      data: [row],
      page: 2,
      pageSize: 25,
      total: 60,
    });

    const state = appointmentQuery().offset(2, 25).build();
    const result = await appointmentsRepository.list(state);

    expect(result.mode).toBe('offset');
    expect(isOffsetResult(result)).toBe(true);
    if (isOffsetResult(result)) {
      expect(result.data).toEqual([row]);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(25);
      expect(result.total).toBe(60);
    }
  });

  it('propagates an ApiError from apiClient unchanged', async () => {
    const apiError = new ApiError(403, 'forbidden', [], 'req-1');
    apiRequestMock.mockRejectedValue(apiError);

    const state = appointmentQuery().offset(1, 25).build();

    await expect(appointmentsRepository.list(state)).rejects.toBe(apiError);
  });
});

describe('appointmentsRepository.get', () => {
  it('requests /appointments/:id and returns the raw appointment', async () => {
    const row = appointmentRow('7');
    apiRequestMock.mockResolvedValue(row);

    const result = await appointmentsRepository.get('7');

    expect(apiRequestMock).toHaveBeenCalledWith('/appointments/7');
    expect(result).toEqual(row);
  });

  it('propagates an ApiError from apiClient unchanged', async () => {
    const apiError = new ApiError(404, 'appointment not found', [], 'req-2');
    apiRequestMock.mockRejectedValue(apiError);

    await expect(appointmentsRepository.get('missing')).rejects.toBe(apiError);
  });
});

describe('appointmentsRepository write paths', () => {
  it('POSTs the create body to /appointments', async () => {
    const row = appointmentRow('9');
    apiRequestMock.mockResolvedValue(row);

    const body = {
      patientId: row.patientId,
      staffId: row.staffId,
      type: 'CONSULTATION',
      startAt: row.startAt,
      endAt: row.endAt,
    } as const;

    const result = await appointmentsRepository.create(body);

    expect(apiRequestMock).toHaveBeenCalledWith('/appointments', {
      method: 'POST',
      body,
    });
    expect(result).toEqual(row);
  });

  it('PATCHes the update body to /appointments/:id', async () => {
    const row = appointmentRow('9');
    apiRequestMock.mockResolvedValue(row);

    const body = { status: 'CONFIRMED' } as const;

    const result = await appointmentsRepository.update('9', body);

    expect(apiRequestMock).toHaveBeenCalledWith('/appointments/9', {
      method: 'PATCH',
      body,
    });
    expect(result).toEqual(row);
  });

  it('DELETEs /appointments/:id and resolves to undefined', async () => {
    apiRequestMock.mockResolvedValue(null);

    const result = await appointmentsRepository.remove('9');

    expect(apiRequestMock).toHaveBeenCalledWith('/appointments/9', {
      method: 'DELETE',
    });
    expect(result).toBeUndefined();
  });

  it('propagates a 409 overlap ApiError from create unchanged', async () => {
    const apiError = new ApiError(
      409,
      'staff member already has an appointment in this time range',
      [],
      'req-3',
    );
    apiRequestMock.mockRejectedValue(apiError);

    await expect(
      appointmentsRepository.create({
        patientId: 'p',
        staffId: 's',
        type: 'CONSULTATION',
        startAt: '2026-10-02T09:00:00Z',
        endAt: '2026-10-02T09:30:00Z',
      }),
    ).rejects.toBe(apiError);
  });
});
