import { describe, expect, it } from 'vitest';

import { isAdmin } from './isAdmin';
import type { User } from './types';

// Pure-predicate coverage for the admin check. Node env, no DOM. `roleName` is a
// free-form string, so case and whitespace variants must all fail by design.

const base: Omit<User, 'roleName'> = {
  id: 'u1',
  email: 'u@zelkora.local',
  fullName: 'Ada Lovelace',
  roleId: 'r1',
  branchId: 'b1',
  permissions: [],
};

const withRole = (roleName: string): User => ({ ...base, roleName });

describe('isAdmin', () => {
  it('grants the exact `admin` role', () => {
    expect(isAdmin(withRole('admin'))).toBe(true);
  });

  it('denies the `nurse` role', () => {
    expect(isAdmin(withRole('nurse'))).toBe(false);
  });

  it('denies the `doctor` role', () => {
    expect(isAdmin(withRole('doctor'))).toBe(false);
  });

  it('denies an empty role name', () => {
    expect(isAdmin(withRole(''))).toBe(false);
  });

  it('denies a null user', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('is case-sensitive — `Admin` does not match', () => {
    expect(isAdmin(withRole('Admin'))).toBe(false);
  });

  it('does not trim — a leading space does not match', () => {
    expect(isAdmin(withRole(' admin'))).toBe(false);
  });
});
