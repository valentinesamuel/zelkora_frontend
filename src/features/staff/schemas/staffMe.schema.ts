/**
 * Response schema for `GET /api/v1/staff/me`.
 *
 * Mirrors `StaffMeResponse` in `zelkora_backend/internal/staff/dto.go`. Like
 * `me.schema.ts` this is a RESPONSE schema — the server is the producer, not the
 * validator — so strictness on the identity fields is CORRECT: `fullName`,
 * `staffNumber`, `profession`, and `branchName` are always non-empty and a
 * missing one is a real contract break we want to fail loudly on.
 *
 * `departmentName` is nullable — a staff row may have no department
 * (`staff.department_id` is nullable, and the JOINed name is then `null`).
 *
 * `.strict()` is deliberately NOT used — a backend that ADDS a field must not
 * break us; unknown keys are stripped.
 */
import { z } from 'zod';

import { PROFESSION_VALUES, type StaffMe } from '@/features/staff/types/staff.types';

// `satisfies z.ZodType<StaffMe, z.ZodTypeDef, unknown>` is the compile-time
// guard: output must be assignable to `StaffMe`, input is `unknown` (the
// repository parses a raw response). A renamed/removed/mistyped field that makes
// the OUTPUT drift from `StaffMe` fails the build here.
export const staffMeSchema = z.object({
  fullName: z.string(),
  staffNumber: z.string(),
  profession: z.enum(PROFESSION_VALUES),
  branchName: z.string(),
  departmentName: z.string().nullable(),
}) satisfies z.ZodType<StaffMe, z.ZodTypeDef, unknown>;

export type StaffMeResponse = z.infer<typeof staffMeSchema>;
