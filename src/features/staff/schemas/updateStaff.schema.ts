/**
 * Form-input schema for the staff edit form. Two fields map to two DIFFERENT
 * backend calls, both submitted from the one form:
 *
 * - profession / licenseNumber / departmentId → `PATCH /staff/:id`
 *   (`UpdateStaffRequest` in `zelkora_backend/internal/staff/dto.go`).
 * - roleId → `PUT /auth/users/:id/role` (`AssignRoleRequest`, the same
 *   endpoint `StaffRoleDialog` uses) — NOT part of `UpdateStaffBody`, which
 *   structurally excludes it (see staff.types.ts). `buildUpdateStaffBody`
 *   never reads `roleId`; `StaffEditPage` submits it separately via
 *   `useAssignStaffRole`.
 *
 * `departmentId` uses NO_DEPARTMENT_VALUE as its "nothing selected" sentinel
 * rather than `''`, because the underlying Radix `Select` cannot hold an
 * empty-string item value.
 */
import { z } from 'zod';

import { PROFESSION_VALUES } from '@/features/staff/types/staff.types';

export const NO_DEPARTMENT_VALUE = '__none__';

export const updateStaffSchema = z.object({
  profession: z.enum(PROFESSION_VALUES),
  licenseNumber: z.string().trim().min(1),
  departmentId: z.string(),
  roleId: z.string().uuid('Select a role.'),
});

export type UpdateStaffValues = z.infer<typeof updateStaffSchema>;
