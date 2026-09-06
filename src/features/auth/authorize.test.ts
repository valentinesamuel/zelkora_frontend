import { describe, expect, it } from 'vitest';

import {
  authorize,
  getUserPermissions,
  permissionSatisfies,
} from './authorize';
import type { User } from './types';

// Pure-function coverage for the authorization decision. Node env, no DOM.
// Because the backend does NO wildcard expansion (invariants I48), this matrix
// is the ONLY specification of the matching rules. Fixtures use the real
// `000007_seed_patient_permissions` names so they double as vocabulary docs.

const base: Omit<User, 'permissions'> = {
  id: 'u1',
  email: 'u@zelkora.local',
  fullName: 'Ada Lovelace',
  roleId: 'r1',
  roleName: 'doctor',
  branchId: 'b1',
};

const withPerms = (permissions: string[]): User => ({ ...base, permissions });

describe('authorize — no authenticated user', () => {
  it('denies when user is null, whatever is asked', () => {
    expect(authorize({ user: null })).toBe(false);
    expect(authorize({ user: null, permission: ['patient:create'] })).toBe(false);
  });
});

describe('authorize — no gate given', () => {
  it('grants an authenticated user when no permission is specified', () => {
    expect(authorize({ user: withPerms([]) })).toBe(true);
  });

  it('treats an empty permission list as "authenticated only"', () => {
    expect(authorize({ user: withPerms([]), permission: [] })).toBe(true);
  });
});

describe('authorize — exact match', () => {
  it('grants on an exact permission hit', () => {
    expect(
      authorize({
        user: withPerms(['patient:create']),
        permission: ['patient:create'],
      }),
    ).toBe(true);
  });

  it('denies on an exact miss', () => {
    expect(
      authorize({
        user: withPerms(['patient:read']),
        permission: ['patient:create'],
      }),
    ).toBe(false);
  });

  it('denies every gate when the user holds no permissions', () => {
    expect(
      authorize({
        user: withPerms([]),
        permission: ['patient:read'],
      }),
    ).toBe(false);
  });
});

describe('authorize — wildcards (the three grant forms only)', () => {
  it('`*:*` grants anything', () => {
    expect(
      authorize({ user: withPerms(['*:*']), permission: ['patient:delete'] }),
    ).toBe(true);
    expect(
      authorize({ user: withPerms(['*:*']), permission: ['billing:refund'] }),
    ).toBe(true);
  });

  it('`resource:*` grants same-resource, denies other-resource', () => {
    expect(
      authorize({
        user: withPerms(['patient:*']),
        permission: ['patient:update'],
      }),
    ).toBe(true);
    expect(
      authorize({
        user: withPerms(['patient:*']),
        permission: ['billing:update'],
      }),
    ).toBe(false);
  });

  it('`*:action` does NOT grant (negative lock — unsupported form)', () => {
    expect(
      authorize({
        user: withPerms(['*:create']),
        permission: ['patient:create'],
      }),
    ).toBe(false);
    expect(permissionSatisfies('*:create', 'patient:create')).toBe(false);
  });

  it('no prefix / substring matching', () => {
    expect(permissionSatisfies('patient:*', 'patients:read')).toBe(false);
    expect(permissionSatisfies('patient:read', 'patient:readonly')).toBe(false);
  });
});

describe('authorize — ALL semantics for a list', () => {
  it('denies when only some required permissions are held', () => {
    expect(
      authorize({
        user: withPerms(['patient:create']),
        permission: ['patient:create', 'patient:delete'],
      }),
    ).toBe(false);
  });

  it('grants when every required permission is held', () => {
    expect(
      authorize({
        user: withPerms(['patient:create', 'patient:delete']),
        permission: ['patient:create', 'patient:delete'],
      }),
    ).toBe(true);
  });

  it('grants a multi-entry list via `*:*`', () => {
    expect(
      authorize({
        user: withPerms(['*:*']),
        permission: ['patient:create', 'patient:delete'],
      }),
    ).toBe(true);
  });
});

describe('permissionSatisfies (single pair)', () => {
  it('covers the three grant forms and nothing else', () => {
    expect(permissionSatisfies('patient:create', 'patient:create')).toBe(true);
    expect(permissionSatisfies('*:*', 'anything:here')).toBe(true);
    expect(permissionSatisfies('patient:*', 'patient:delete')).toBe(true);
    expect(permissionSatisfies('patient:read', 'patient:create')).toBe(false);
    expect(permissionSatisfies('other:*', 'patient:create')).toBe(false);
  });
});

describe('getUserPermissions', () => {
  it('returns the array identity from the user', () => {
    const perms = ['patient:read'];
    expect(getUserPermissions(withPerms(perms))).toBe(perms);
  });
});
