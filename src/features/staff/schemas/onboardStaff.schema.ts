/**
 * Form-input schema for the staff invite form (`POST /api/v1/staff`).
 *
 * Mirrors the binding tags on `OnboardStaffRequest` in
 * `zelkora_backend/internal/staff/dto.go` and MUST NOT be stricter than that
 * binding (INV-A2): the backend requires `email`, `fullName`, `roleId`,
 * `branchId`, `profession`, `licenseNumber`; `departmentId` is optional.
 */
import { z } from 'zod';

import { PROFESSION_VALUES } from '@/features/staff/types/staff.types';

export const onboardStaffSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  roleId: z.string().uuid(),
  branchId: z.string().uuid(),
  profession: z.enum(PROFESSION_VALUES),
  licenseNumber: z.string().trim().min(1),
  departmentId: z.string().uuid().optional(),
});

export type OnboardStaffValues = z.infer<typeof onboardStaffSchema>;
