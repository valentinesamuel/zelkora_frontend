// INV: `rolesKeys.root` MUST be exactly `['roles']` — `staffKeys.roles()`
// (src/features/staff/api/staff.keys.ts) uses the same literal tuple for the
// staff-invite role dropdown. If the two roots ever diverge, invalidating
// `rolesKeys.root` after a role mutation stops reaching that dropdown's
// cache entry — a silent stale-data bug, not a crash.

import { describe, expect, it } from 'vitest';

import { rolesKeys } from '@/features/roles/roles.keys';
import { staffKeys } from '@/features/staff/api/staff.keys';

describe('rolesKeys', () => {
  it('root is exactly ["roles"]', () => {
    expect(rolesKeys.root).toEqual(['roles']);
  });

  it('root matches staffKeys.roles() exactly, so a shared invalidation reaches both', () => {
    expect(rolesKeys.root).toEqual(staffKeys.roles());
  });

  it('list() is prefixed by root', () => {
    expect(rolesKeys.list().slice(0, rolesKeys.root.length)).toEqual(
      rolesKeys.root,
    );
    expect(rolesKeys.list()).toEqual(['roles', 'list']);
  });

  it('detail(id) is prefixed by root and stable per id', () => {
    expect(rolesKeys.detail('abc')).toEqual(['roles', 'detail', 'abc']);
  });

  it('permissions() is a distinct constant tuple', () => {
    expect(rolesKeys.permissions()).toEqual(['roles', 'permissions']);
  });
});
