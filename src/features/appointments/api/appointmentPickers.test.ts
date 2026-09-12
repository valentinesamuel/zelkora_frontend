// Covers `createSearchStaffOptions`'s query-building: branch scoping is
// admin+branch only, and search terms build both the trigram name clause and
// the ilike staff-code clause. `staffRepository.list` is mocked so we can
// inspect the exact `QueryState` the builder produced, without exercising the
// HTTP layer.

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSearchStaffOptions } from '@/features/appointments/api/appointmentPickers';
import { staffRepository } from '@/features/staff/api/staffRepository';
import type { StaffListItem } from '@/features/staff/types/staff.types';

vi.mock('@/features/staff/api/staffRepository', () => ({
  staffRepository: {
    list: vi.fn(),
  },
}));

const listMock = vi.mocked(staffRepository.list);

function staffRow(overrides: Partial<StaffListItem> = {}): StaffListItem {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    userId: 'u1',
    staffNumber: 'STF-001',
    profession: 'doctor',
    branchId: 'b1',
    departmentId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    user: {
      id: 'u1',
      fullName: 'Dr House',
      email: 'house@example.com',
      roleId: 'r1',
      status: 'active',
    },
    branch: null,
    ...overrides,
  };
}

const BRANCH_ID = 'a0359696-51e0-48c0-ba37-4adefe284711';

beforeEach(() => {
  listMock.mockReset();
  listMock.mockResolvedValue({
    mode: 'cursor',
    data: [staffRow()],
    nextCursor: null,
  });
});

describe('createSearchStaffOptions', () => {
  // The backend requires the branch scope as a bare `?branchId=` query param
  // (`branchscope.ResolveBranchID`), not a `filter[branchId][...]` clause —
  // so it's passed as `staffRepository.list`'s second argument, not a
  // `.where()` filter on the built query state.
  it('passes branchId as the second list() argument for an admin caller with a selected branch', async () => {
    const search = createSearchStaffOptions({
      isAdminCaller: true,
      branchId: BRANCH_ID,
    });
    await search('');

    expect(listMock.mock.calls[0]?.[1]).toBe(BRANCH_ID);
    const query = listMock.mock.calls[0]?.[0];
    expect(query?.filters.some((f) => f.field === 'branchId')).toBe(false);
  });

  it('never sends a branchId param for a non-admin caller, even if one is present in scope', async () => {
    const search = createSearchStaffOptions({
      isAdminCaller: false,
      branchId: BRANCH_ID,
    });
    await search('');

    expect(listMock.mock.calls[0]?.[1]).toBeUndefined();
  });

  it('sends no branchId param for an admin caller with no branch selected', async () => {
    const search = createSearchStaffOptions({
      isAdminCaller: true,
      branchId: null,
    });
    await search('');

    expect(listMock.mock.calls[0]?.[1]).toBeUndefined();
  });

  it('builds both the user.fullName (tri) and staffNumber (ilike) search clauses for a non-empty term', async () => {
    const search = createSearchStaffOptions({
      isAdminCaller: false,
      branchId: null,
    });
    await search('house');

    const query = listMock.mock.calls[0]?.[0];
    expect(query?.searches).toContainEqual({
      field: 'user.fullName',
      mode: 'tri',
      term: 'house',
    });
    expect(query?.searches).toContainEqual({
      field: 'staffNumber',
      mode: 'ilike',
      term: 'house',
    });
  });

  it('returns a default sorted page with no search clause for an empty term', async () => {
    const search = createSearchStaffOptions({
      isAdminCaller: false,
      branchId: null,
    });
    const options = await search('   ');

    const query = listMock.mock.calls[0]?.[0];
    expect(query?.searches).toHaveLength(0);
    expect(query?.sort).toContainEqual({
      field: 'createdAt',
      direction: 'desc',
    });
    expect(options).toEqual([
      { value: staffRow().id, label: 'Dr House · doctor' },
    ]);
  });
});
