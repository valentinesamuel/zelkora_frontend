// TanStack Query cache keys for the Role entity.
//
// `root` MUST be exactly `['roles']` — `src/features/staff/api/staff.keys.ts`
// already uses `staffKeys.roles()` returning the same tuple `['roles']` for
// the staff-invite role dropdown. Both keys must agree so that invalidating
// `rolesKeys.root` after a role create/update/delete also invalidates the
// staff feature's cached role list — otherwise that dropdown would silently
// go stale (no crash, just wrong data) instead of refetching.

const root = ['roles'] as const;

function list() {
  return [...root, 'list'] as const;
}

function detail(id: string) {
  return [...root, 'detail', id] as const;
}

// Deliberately NOT nested under `root` structurally different from
// `list`/`detail` (`root` is included via the literal, not a spread of a
// `details()` helper) — permissions are a distinct sub-resource
// (`GET /auth/permissions`), not a role list/detail variant.
function permissions() {
  return ['roles', 'permissions'] as const;
}

export const rolesKeys = {
  root,
  list,
  detail,
  permissions,
};
