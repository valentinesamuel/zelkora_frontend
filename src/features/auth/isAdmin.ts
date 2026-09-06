import type { User } from './types';

// TODO(FU-1): roleName is editable DB data, not an enum — move to a capability
// gate (e.g. useCan({ permission: ['settings:*'] })) once the backend seeds such
// a permission. Renaming the admin role silently kills this check.
export function isAdmin(user: User | null): boolean {
  return user?.roleName === 'admin';
}
