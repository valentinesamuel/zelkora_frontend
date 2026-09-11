import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/app/providers/queryClient';
import { apiRequest } from '@/lib/apiClient';

import { staffKeys } from '@/features/staff/api/staff.keys';
import { staffRepository } from '@/features/staff/api/staffRepository';
import type {
  OnboardStaffBody,
  UpdateStaffBody,
} from '@/features/staff/types/staff.types';

// Response of `POST /staff` — mirrors `StaffResponse` in
// `zelkora_backend/internal/staff/dto.go`. Success is HTTP 200 (NOT 201);
// `apiRequest` resolves on any success envelope and throws `ApiError`
// otherwise — do NOT assert a status code here.
interface OnboardedStaff {
  id: string;
  userId: string;
  staffNumber: string;
  profession: string;
  branchId: string;
  baseBranchId: string;
  departmentId: string | null;
  licenseNumber: string;
  createdAt: string;
  updatedAt: string;
}

export function onboardStaff(body: OnboardStaffBody): Promise<OnboardedStaff> {
  return apiRequest<OnboardedStaff>('/staff', { method: 'POST', body });
}

// Invalidates the whole `['staff']` subtree so `useStaffList` (and
// `useStaffMe`) re-run after an onboard.
function invalidateStaff(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: staffKeys.all });
}

export function useOnboardStaff() {
  return useMutation({
    mutationFn: onboardStaff,
    onSuccess: invalidateStaff,
  });
}

export interface UpdateStaffInput {
  id: string;
  body: UpdateStaffBody;
}

function updateStaff({ id, body }: UpdateStaffInput) {
  return staffRepository.update(id, body);
}

export function useUpdateStaff() {
  return useMutation({
    mutationFn: updateStaff,
    onSuccess: invalidateStaff,
  });
}

export interface AssignStaffRoleInput {
  // The USER id (`StaffListItem.userId` / `StaffListItem.user.id`) — NOT the
  // staff id. `PUT /auth/users/:id/role` resolves `:id` against `users`, so a
  // staff id here would 404 (or, worse, hit an unrelated user).
  userId: string;
  roleId: string;
}

// `PUT /auth/users/:id/role` — responds 200 with a null `result`
// (internal/auth/handler.go AssignUserRole: `response.OK[any](c, ..., nil)`).
// Sentinel errors: 409 last-admin guard, 404 user-or-role gone. A re-scope 401
// is byte-identical to an expired-token 401 and is already recovered
// transparently by `apiRequest`'s single-flight refresh (INV-13) — there is
// deliberately no special-casing for it here.
export function assignStaffRole({
  userId,
  roleId,
}: AssignStaffRoleInput): Promise<null> {
  return apiRequest<null>(`/auth/users/${userId}/role`, {
    method: 'PUT',
    body: { roleId },
  });
}

// Invalidates BOTH subtrees:
//   - `['staff']` so the list re-reads the joined `user.roleId`;
//   - `['roles']` (`staffKeys.roles()`, the same literal tuple as
//     `rolesKeys.root`) so the role list's per-role user counts and the staff
//     role dropdown both refresh. Required, not incidental — a role
//     reassignment moves a user between two roles' counts.
async function invalidateStaffAndRoles(): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: staffKeys.all }),
    queryClient.invalidateQueries({ queryKey: staffKeys.roles() }),
  ]);
}

export function useAssignStaffRole() {
  return useMutation({
    mutationFn: assignStaffRole,
    onSuccess: invalidateStaffAndRoles,
  });
}
