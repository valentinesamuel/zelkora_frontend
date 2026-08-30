import { describe, expect, it } from 'vitest';

import { authorize, getUserPermissions } from './authorize';
import { RoleEnum, type User } from './types';

// Pure-function coverage for the authorization decision. Node env, no DOM.

const doctor: User = {
  id: 'u1',
  email: 'doc@zelkora.local',
  fullName: 'Dr House',
  role: RoleEnum.DOCTOR,
  branchId: 'b1',
};

const admin: User = { ...doctor, id: 'u2', role: RoleEnum.ADMIN };

describe('authorize — no authenticated user', () => {
  it('denies when user is null, whatever is asked', () => {
    expect(authorize({ user: null })).toBe(false);
    expect(authorize({ user: null, role: [RoleEnum.DOCTOR] })).toBe(false);
    expect(authorize({ user: null, permission: ['patients.update'] })).toBe(false);
  });
});

describe('authorize — no gate given', () => {
  it('grants an authenticated user when neither role nor permission is specified', () => {
    expect(authorize({ user: doctor })).toBe(true);
  });

  it('treats empty lists as "not gated on that axis"', () => {
    expect(authorize({ user: doctor, role: [], permission: [] })).toBe(true);
  });
});

describe('authorize — role matching (exact)', () => {
  it('grants on an exact role match', () => {
    expect(authorize({ user: doctor, role: [RoleEnum.DOCTOR] })).toBe(true);
  });

  it('denies on a role mismatch', () => {
    expect(authorize({ user: doctor, role: [RoleEnum.NURSE] })).toBe(false);
  });

  it('grants admin only for RoleEnum.ADMIN', () => {
    expect(authorize({ user: admin, role: [RoleEnum.ADMIN] })).toBe(true);
    expect(authorize({ user: admin, role: [RoleEnum.DOCTOR] })).toBe(false);
  });

  it('grants when any one role in the list matches', () => {
    expect(
      authorize({
        user: doctor,
        role: [RoleEnum.ADMIN, RoleEnum.DOCTOR, RoleEnum.NURSE],
      }),
    ).toBe(true);
  });
});

describe('authorize — permission axis (inert today)', () => {
  it('denies a permission-only check while getUserPermissions returns []', () => {
    expect(authorize({ user: doctor, permission: ['patients.update'] })).toBe(false);
  });
});

describe('authorize — role OR permission', () => {
  it('grants when the role matches even though no permission is held', () => {
    expect(
      authorize({
        user: doctor,
        role: [RoleEnum.DOCTOR],
        permission: ['patients.update'],
      }),
    ).toBe(true);
  });

  it('denies when the role mismatches and no permission is held', () => {
    expect(
      authorize({
        user: doctor,
        role: [RoleEnum.NURSE],
        permission: ['patients.update'],
      }),
    ).toBe(false);
  });
});

describe('getUserPermissions', () => {
  it('returns an empty list until the backend issues permissions', () => {
    expect(getUserPermissions(doctor)).toEqual([]);
  });
});
