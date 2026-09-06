import { describe, expect, it } from 'vitest';

import { meResponseSchema } from './me.schema';

// Drift tripwire for the hand-authored mirror of `MeResponse` in
// `zelkora_backend/internal/auth/dto.go` (INV-P11). If the backend struct's
// field set changes, this file must change in lockstep or these tests fail.

// The exact field set of MeResponse (dto.go): id, email, fullName, roleId,
// roleName, branchId, permissions. Seven keys. No `role`, no first/last name.
const EXPECTED_KEYS = [
  'id',
  'email',
  'fullName',
  'roleId',
  'roleName',
  'branchId',
  'permissions',
].sort();

const validPayload = {
  id: 'u1',
  email: 'admin@zelkora.test',
  fullName: 'Seed Admin',
  roleId: 'r1',
  roleName: 'admin',
  branchId: 'b1',
  permissions: ['*:*'],
};

describe('meResponseSchema — field set', () => {
  it('parses exactly the 7 MeResponse keys (dto.go)', () => {
    const parsed = meResponseSchema.parse(validPayload);
    expect(Object.keys(parsed).sort()).toEqual(EXPECTED_KEYS);
  });

  it('produces no firstName / lastName key (INV-P13 — users has only full_name)', () => {
    const parsed = meResponseSchema.parse(validPayload) as Record<
      string,
      unknown
    >;
    expect('firstName' in parsed).toBe(false);
    expect('lastName' in parsed).toBe(false);
    expect(parsed.fullName).toBe('Seed Admin');
  });

  it('strips unknown keys, does not reject them (backend may add fields)', () => {
    const parsed = meResponseSchema.parse({
      ...validPayload,
      somethingNew: 42,
    }) as Record<string, unknown>;
    expect('somethingNew' in parsed).toBe(false);
    expect(Object.keys(parsed).sort()).toEqual(EXPECTED_KEYS);
  });
});

describe('meResponseSchema — permissions leniency (INV-P4 / INV-P12)', () => {
  it('absent permissions ⇒ []', () => {
    const { permissions: _omit, ...noPerms } = validPayload;
    void _omit;
    expect(meResponseSchema.parse(noPerms).permissions).toEqual([]);
  });

  it('permissions: null ⇒ []', () => {
    expect(
      meResponseSchema.parse({ ...validPayload, permissions: null }).permissions,
    ).toEqual([]);
  });

  it('permissions: garbage ⇒ []', () => {
    expect(
      meResponseSchema.parse({ ...validPayload, permissions: 'nope' })
        .permissions,
    ).toEqual([]);
  });
});

describe('meResponseSchema — identity strictness (INV-P10)', () => {
  it('throws when roleName is missing', () => {
    const { roleName: _omit, ...noRoleName } = validPayload;
    void _omit;
    expect(() => meResponseSchema.parse(noRoleName)).toThrow();
  });

  it('throws when roleId is missing', () => {
    const { roleId: _omit, ...noRoleId } = validPayload;
    void _omit;
    expect(() => meResponseSchema.parse(noRoleId)).toThrow();
  });

  it('accepts branchId: null', () => {
    expect(
      meResponseSchema.parse({ ...validPayload, branchId: null }).branchId,
    ).toBeNull();
  });
});
