import { describe, expect, it } from 'vitest';

import { groupPermissions } from '@/features/roles/permissionGroups';
import type { Permission } from '@/features/roles/roles.types';

function perm(id: string, name: string): Permission {
  return { id, name };
}

describe('groupPermissions', () => {
  it('groups by the resource segment before the colon', () => {
    const groups = groupPermissions([
      perm('1', 'patient:read'),
      perm('2', 'patient:create'),
      perm('3', 'branch:read'),
    ]);

    expect(groups).toEqual([
      { resource: 'branch', permissions: [perm('3', 'branch:read')] },
      {
        resource: 'patient',
        permissions: [perm('1', 'patient:read'), perm('2', 'patient:create')],
      },
    ]);
  });

  it('returns resources sorted alphabetically', () => {
    const groups = groupPermissions([
      perm('1', 'staff:read'),
      perm('2', 'branch:read'),
      perm('3', 'role:read'),
    ]);

    expect(groups.map((g) => g.resource)).toEqual(['branch', 'role', 'staff']);
  });

  it('filters out any permission literally named "*:*" (defense in depth)', () => {
    const groups = groupPermissions([
      perm('1', '*:*'),
      perm('2', 'patient:read'),
    ]);

    expect(groups).toEqual([
      { resource: 'patient', permissions: [perm('2', 'patient:read')] },
    ]);
    const allNames = groups.flatMap((g) => g.permissions.map((p) => p.name));
    expect(allNames).not.toContain('*:*');
  });

  it('returns an empty array for an empty input', () => {
    expect(groupPermissions([])).toEqual([]);
  });
});
