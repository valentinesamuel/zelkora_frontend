import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/app/providers/queryClient';
import { apiRequest } from '@/lib/apiClient';

import { staffKeys } from '@/features/staff/api/staff.keys';
import { inviteRepository } from '@/features/staff/api/inviteRepository';
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
  branchName: string;
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

// ---------------------------------------------------------------------------
// Invite resend/revoke vs. suspend/reactivate — a load-bearing id asymmetry.
//
// `useResendInvite` / `useRevokeInvite` key off the STAFF id (`staff.id`) —
// they hit `POST /staff/:id/invite/{resend,revoke}`, which resolves `:id`
// against the `staff` table (see `inviteRepository.ts`).
//
// `useSuspendStaff` / `useReactivateStaff` key off the USER id
// (`StaffListItem.userId` / `StaffListItem.user.id`) — NOT `staff.id` — they
// hit `POST /auth/users/:id/{disable,enable}`, which resolves `:id` against
// `users` (mirrors the same "the USER id, never `staff.id`" convention as
// `useAssignStaffRole` above and `StaffRoleDialog`). Passing the staff id here
// would 404 (or, worse, hit an unrelated user).
// ---------------------------------------------------------------------------

export interface ResendInviteInput {
  staffId: string;
}

function resendInvite({ staffId }: ResendInviteInput) {
  return inviteRepository.resend(staffId);
}

export function useResendInvite() {
  return useMutation({
    mutationFn: resendInvite,
    onSuccess: invalidateStaff,
  });
}

export interface RevokeInviteInput {
  staffId: string;
}

function revokeInvite({ staffId }: RevokeInviteInput) {
  return inviteRepository.revoke(staffId);
}

export function useRevokeInvite() {
  return useMutation({
    mutationFn: revokeInvite,
    onSuccess: invalidateStaff,
  });
}

export interface SuspendStaffInput {
  // The USER id — see the block comment above.
  userId: string;
}

function suspendStaff({ userId }: SuspendStaffInput): Promise<null> {
  return apiRequest<null>(`/auth/users/${userId}/disable`, { method: 'POST' });
}

export function useSuspendStaff() {
  return useMutation({
    mutationFn: suspendStaff,
    onSuccess: invalidateStaff,
  });
}

export interface ReactivateStaffInput {
  // The USER id — see the block comment above.
  userId: string;
}

function reactivateStaff({ userId }: ReactivateStaffInput): Promise<null> {
  return apiRequest<null>(`/auth/users/${userId}/enable`, { method: 'POST' });
}

export function useReactivateStaff() {
  return useMutation({
    mutationFn: reactivateStaff,
    onSuccess: invalidateStaff,
  });
}
