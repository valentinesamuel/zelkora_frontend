import { describe, expect, it } from 'vitest';

import {
  emptyRoleFormValues,
  roleToFormValues,
  toCreateInput,
  toUpdateInput,
} from '@/features/roles/roleForm';
import type { Role } from '@/features/roles/roles.types';

const wireRole: Role = {
  id: 'role-1',
  name: 'Nurse',
  description: 'Ward nurse',
  userCount: 3,
  permissions: [
    { id: 'perm-1', name: 'patient:read' },
    { id: 'perm-2', name: 'patient:update' },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('emptyRoleFormValues', () => {
  it('defaults to an empty name/description and an empty permissionIds array', () => {
    expect(emptyRoleFormValues()).toEqual({
      name: '',
      description: '',
      permissionIds: [],
    });
  });
});

describe('roleToFormValues', () => {
  it('projects the wire record, mapping permissions to their ids', () => {
    expect(roleToFormValues(wireRole)).toEqual({
      name: 'Nurse',
      description: 'Ward nurse',
      permissionIds: ['perm-1', 'perm-2'],
    });
  });
});

describe('toCreateInput', () => {
  it('trims name and omits an empty description', () => {
    expect(
      toCreateInput({
        name: '  Nurse  ',
        description: '   ',
        permissionIds: ['perm-1'],
      }),
    ).toEqual({ name: 'Nurse', permissionIds: ['perm-1'] });
  });

  it('includes a non-empty trimmed description', () => {
    expect(
      toCreateInput({
        name: 'Nurse',
        description: '  Ward nurse  ',
        permissionIds: [],
      }),
    ).toEqual({
      name: 'Nurse',
      description: 'Ward nurse',
      permissionIds: [],
    });
  });

  // INVARIANT: an empty permissionIds array must survive the builder
  // unchanged — it is a legal request body, not something to special-case
  // away.
  it('preserves an EMPTY permissionIds array', () => {
    const body = toCreateInput({
      name: 'Nurse',
      description: '',
      permissionIds: [],
    });
    expect(body.permissionIds).toEqual([]);
  });
});

describe('toUpdateInput', () => {
  it('builds the same shape as toCreateInput (PUT is a full replace)', () => {
    const values = {
      name: 'Nurse',
      description: 'Ward nurse',
      permissionIds: ['perm-1'],
    };
    expect(toUpdateInput(values)).toEqual(toCreateInput(values));
  });

  it('preserves an EMPTY permissionIds array', () => {
    const body = toUpdateInput({
      name: 'Nurse',
      description: '',
      permissionIds: [],
    });
    expect(body.permissionIds).toEqual([]);
  });
});
