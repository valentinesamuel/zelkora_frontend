import type { User } from './types';
import type { PERMISSIONS } from './permissions';

export type Permission = string;

type PermissionValues<T> = T extends string
  ? T
  : T extends object
    ? { [K in keyof T]: PermissionValues<T[K]> }[keyof T]
    : never;

/**
 * The literal union of registered permission names (see `permissions.ts`).
 * Used by `Can`/`useCan` — the declarative, component-facing gates — so a
 * typo in a call site fails to compile. `authorize`/`permissionSatisfies`
 * below stay on the opaque `Permission` (string) type: they're the general
 * matching primitive, exercised in tests against arbitrary resource:action
 * strings (including ones this frontend hasn't registered yet), and a held
 * permission from the server can likewise be any string, including
 * wildcards (`*:*`, `X:*`).
 */
export type RequiredPermission = PermissionValues<typeof PERMISSIONS>;

export interface AuthorizeInput {
  user: User | null;
  permission?: Permission[];
}

/**
 * Client-side authorization decision. UX gating only — the server re-checks
 * every request (see `Can.tsx` and INV-P9).
 *
 * Permission strings are `resource:action`. The backend treats them as opaque
 * and does NO wildcard expansion (backend invariants I48) — this function is the
 * SOLE implementation of the matching rules, so there is no server-side backstop
 * for an over-permissive matcher. A required `X:Y` is satisfied by a held `H`
 * iff:
 *   1. `H === 'X:Y'`   (exact), or
 *   2. `H === '*:*'`   (global superuser), or
 *   3. `H === 'X:*'`   (resource-wide).
 * Nothing else. `*:Y` (action-wide across resources) does NOT grant, nor do
 * prefixes, regex/glob, `**`, or case-insensitive / whitespace-tolerant compares.
 *
 * A `permission` list uses ALL semantics: every entry must be satisfied by some
 * held permission. An undefined or empty list means "authenticated only".
 */
export function authorize({ user, permission }: AuthorizeInput): boolean {
  if (!user) {
    return false;
  }

  const gatedOnPermission = permission !== undefined && permission.length > 0;
  if (!gatedOnPermission) {
    return true;
  }

  const held = getUserPermissions(user);
  return permission.every((required) =>
    held.some((h) => permissionSatisfies(h, required)),
  );
}

/**
 * True iff a single held permission `held` satisfies a single required
 * permission `required`, per the three grant forms above. Exported so the test
 * matrix can exercise the wildcard rules directly.
 */
export function permissionSatisfies(
  held: Permission,
  required: Permission,
): boolean {
  if (held === required) return true;
  if (held === '*:*') return true;
  const colon = required.indexOf(':');
  if (colon === -1) return false;
  const resource = required.slice(0, colon);
  return held === `${resource}:*`;
}

export function getUserPermissions(user: User): Permission[] {
  return user.permissions;
}
