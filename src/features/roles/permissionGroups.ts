import type { Permission } from '@/features/roles/roles.types';

export interface PermissionGroup {
  readonly resource: string;
  readonly permissions: readonly Permission[];
}

// Splits each permission name on `:` into `resource:action`, groups by
// resource, and returns a stable alphabetically-ordered array.
//
// Filters out any permission literally named `*:*` — the server never
// returns it from `GET /auth/permissions`, but this is defense in depth
// (three independent filters exist across the system for this invariant:
// the seed data, the server's list endpoint, and this function). `*:*` must
// never reach a rendered checkbox surface.
export function groupPermissions(
  permissions: readonly Permission[],
): PermissionGroup[] {
  const byResource = new Map<string, Permission[]>();

  for (const permission of permissions) {
    if (permission.name === '*:*') continue;
    const [resource] = permission.name.split(':');
    const key = resource || permission.name;
    const bucket = byResource.get(key);
    if (bucket) {
      bucket.push(permission);
    } else {
      byResource.set(key, [permission]);
    }
  }

  return [...byResource.keys()].sort().map((resource) => ({
    resource,
    permissions: byResource.get(resource) ?? [],
  }));
}
