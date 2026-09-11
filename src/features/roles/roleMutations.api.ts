import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/app/providers/queryClient';
import { apiRequest } from '@/lib/apiClient';

import { rolesKeys } from '@/features/roles/roles.keys';
import type {
  CreateRoleInput,
  Role,
  UpdateRoleInput,
} from '@/features/roles/roles.types';

// `POST /auth/roles` — response.OK is hard-coded 200 server-side (not 201);
// `apiRequest` already treats any `success:true` envelope as success
// regardless of HTTP status, so there is nothing special to branch on here.
export function createRole(body: CreateRoleInput): Promise<Role> {
  return apiRequest<Role>('/auth/roles', { method: 'POST', body });
}

// `PUT /auth/roles/:id` — a full replace, not a partial patch.
export function updateRole(id: string, body: UpdateRoleInput): Promise<Role> {
  return apiRequest<Role>(`/auth/roles/${id}`, { method: 'PUT', body });
}

export function deleteRole(id: string): Promise<null> {
  return apiRequest<null>(`/auth/roles/${id}`, { method: 'DELETE' });
}

// Invalidates the whole `['roles']` subtree — this ALSO invalidates
// `staffKeys.roles()` (`['roles']`), which is required, not incidental: the
// staff-invite role dropdown must re-run after a role is created, renamed, or
// removed.
function invalidateRoles(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: rolesKeys.root });
}

export function useCreateRole() {
  return useMutation({
    mutationFn: createRole,
    onSuccess: invalidateRoles,
  });
}

export function useUpdateRole(id: string) {
  return useMutation({
    mutationFn: (body: UpdateRoleInput) => updateRole(id, body),
    onSuccess: invalidateRoles,
  });
}

export function useDeleteRole(id: string) {
  return useMutation({
    mutationFn: () => deleteRole(id),
    onSuccess: invalidateRoles,
  });
}
