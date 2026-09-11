// HTTP access for the Role entity. `apiClient` is the single HTTP seam —
// never a raw `fetch` call (INV-14).

import { apiRequest } from '@/lib/apiClient';

import type { Permission, Role } from '@/features/roles/roles.types';

function list(): Promise<Role[]> {
  return apiRequest<Role[]>('/auth/roles');
}

function get(id: string): Promise<Role> {
  return apiRequest<Role>(`/auth/roles/${id}`);
}

function permissions(): Promise<Permission[]> {
  return apiRequest<Permission[]>('/auth/permissions');
}

export const rolesRepository = { list, get, permissions };
