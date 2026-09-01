import type { Role, User } from './types';

export type Permission = string;

export interface AuthorizeInput {
  user: User | null;
  role?: Role[];
  permission?: Permission[];
}

 
export function authorize({ user, role, permission }: AuthorizeInput): boolean {
  if (!user) {
    return false;
  }

  const gatedOnRole = role !== undefined && role.length > 0;
  const gatedOnPermission = permission !== undefined && permission.length > 0;

  if (!gatedOnRole && !gatedOnPermission) {
    return true;
  }

  const roleGranted = gatedOnRole && role.includes(user.role);

  const held = getUserPermissions(user);
  const permissionGranted =
    gatedOnPermission && permission.some((p) => held.includes(p));

  return roleGranted || permissionGranted;
}
export function getUserPermissions(user: User): Permission[] {
  return user.permissions ?? [];
}
