/**
 * Response schema for `GET /api/v1/auth/me`.
 *
 * Mirrors `MeResponse` in `zelkora_backend/internal/auth/dto.go` (verified
 * 2026-09-02). Unlike `schemas.ts` — which mirrors REQUEST binding tags and is
 * governed by INV-A2 ("never be stricter than the server") — this is a RESPONSE
 * schema. The server is the producer, not the validator, so strictness on the
 * identity fields is CORRECT: `users.role_id` is `NOT NULL` and `GetUserByID`
 * JOINs `roles`, so `id` / `email` / `fullName` / `roleId` / `roleName` are
 * always non-empty strings and a missing one is a real contract break we want to
 * fail loudly on (INV-P10, INV-P12).
 *
 * `fullName` is a single verbatim string — the backend `users` table has only
 * `full_name`, no `first_name`/`last_name`. Never split it (INV-P13).
 *
 * `permissions` is lenient (`.catch([])`): absent / null / malformed collapses to
 * `[]` so an old backend during the deploy-order window fails CLOSED (every gate
 * denies) rather than crashing (INV-P4, INV-P12). `.strict()` is deliberately
 * NOT used — a backend that ADDS a field must not break us; unknown keys are
 * stripped.
 */
import { z } from 'zod';

import type { User } from './types';

// `satisfies z.ZodType<User, z.ZodTypeDef, unknown>` is the compile-time guard:
// output must be assignable to `User`, input is `unknown` (`getMe` parses a raw
// response). If a field is renamed/removed/mistyped so the OUTPUT drifts from
// `User`, this line fails the build. The reverse direction — the schema omitting
// a `User` field — is caught by the exact 7-key assertion in `me.schema.test.ts`
// (INV-P11).
export const meResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  roleId: z.string(),
  roleName: z.string(),
  branchId: z.string().nullable(),
  permissions: z.array(z.string()).catch([]),
}) satisfies z.ZodType<User, z.ZodTypeDef, unknown>;
