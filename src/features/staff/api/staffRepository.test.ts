import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiRequest } from '@/lib/apiClient';

import { staffQuery } from '@/features/staff/api/staff.queryMeta';
import { staffRepository } from '@/features/staff/api/staffRepository';

vi.mock('@/lib/apiClient', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/apiClient')>('@/lib/apiClient');
  return { ...actual, apiRequest: vi.fn() };
});

const apiRequestMock = vi.mocked(apiRequest);

beforeEach(() => {
  apiRequestMock.mockReset();
});

describe('staffRepository.list', () => {
  it('requests the exact URL for a representative query with no branchId', async () => {
    apiRequestMock.mockResolvedValue({ data: [], nextCursor: null });

    const state = staffQuery().sort('createdAt', 'desc').limit(25).build();
    await staffRepository.list(state);

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/staff?sort=-createdAt&limit=25&paginationMode=cursor',
    );
  });

  // Backend `branchscope.ResolveBranchID` requires this as a bare
  // `?branchId=` param from admin callers, alongside (not instead of) the
  // usual filter/sort/limit params.
  it('appends a bare branchId param when supplied', async () => {
    apiRequestMock.mockResolvedValue({ data: [], nextCursor: null });

    const state = staffQuery().sort('createdAt', 'desc').limit(25).build();
    await staffRepository.list(state, 'a0359696-51e0-48c0-ba37-4adefe284711');

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/staff?sort=-createdAt&limit=25&paginationMode=cursor&branchId=a0359696-51e0-48c0-ba37-4adefe284711',
    );
  });

  it('propagates an ApiError from apiClient unchanged', async () => {
    const apiError = new ApiError(
      400,
      'branchId is required for admin callers',
      [],
      'req-1',
    );
    apiRequestMock.mockRejectedValue(apiError);

    const state = staffQuery().limit(25).build();

    await expect(staffRepository.list(state)).rejects.toBe(apiError);
  });
});
