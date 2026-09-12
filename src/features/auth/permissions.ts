/**
 * The registered permission names this frontend gates on. Each value is a
 * `resource:action` string the backend enforces.
 *
 * PATIENT: mirrors zelkora_backend/migrations/000007_seed_patient_permissions.up.sql
 * — seeded in the `permissions` table. This block grows one resource entry per
 * future seed migration; it is not hand-extended speculatively ahead of what is
 * seeded.
 *
 * BRANCH: enforced by route middleware —
 * `zelkora_backend/internal/branch/routes.go` guards every `/branches` route
 * with `auth.RequirePermission(...)` — AND now seeded:
 * `zelkora_backend/migrations/000011_seed_role_branch_permissions.up.sql`
 * inserts `branch:{create,read,update,delete}` into the `permissions` table, so
 * H-3 (route-enforced but unseeded vocabulary) is fixed and a non-admin role
 * can be granted these through `role_permissions`. No `role_permissions` link
 * is seeded by that migration — `admin` already satisfies them via `*:*`
 * (migration 000001). DELETE is still omitted from this frontend constant
 * deliberately — there is no DELETE route and no delete UI (INV-B2) — even
 * though the permission itself is now seeded.
 *
 * STAFF / USER: seeded in
 * `zelkora_backend/migrations/000009_seed_staff_user_permissions.up.sql` and
 * defined in `zelkora_backend/internal/platform/authz/authz.go`. `staff:delete`
 * and `user:*` beyond invite/disable/assign_role are omitted — no route and no
 * UI for them.
 *
 * ROLE / USER.ASSIGN_ROLE: seeded in
 * `zelkora_backend/migrations/000011_seed_role_branch_permissions.up.sql` and
 * mirrored in `zelkora_backend/internal/platform/authz/authz.go`.
 *
 * APPOINTMENT: seeded in
 * `zelkora_backend/migrations/000013_seed_appointment_permissions.up.sql` and
 * mirrored in `internal/platform/authz/authz.go`.
 *
 * This lockstep is enforced mechanically, not by review: `permissions.sync.test.ts`
 * asserts every value here is seeded by a backend migration. It is a SUBSET
 * assertion — see that file for why `*:*` and `branch:delete` are seeded but
 * deliberately absent from this constant.
 */
export const PERMISSIONS = {
  PATIENT: {
    CREATE: 'patient:create',
    READ: 'patient:read',
    UPDATE: 'patient:update',
    DELETE: 'patient:delete',
  },
  BRANCH: {
    CREATE: 'branch:create',
    READ: 'branch:read',
    UPDATE: 'branch:update',
  },
  STAFF: { CREATE: 'staff:create', READ: 'staff:read', UPDATE: 'staff:update' },
  ROLE: {
    CREATE: 'role:create',
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
  },
  APPOINTMENT: {
    CREATE: 'appointment:create',
    READ: 'appointment:read',
    UPDATE: 'appointment:update',
    DELETE: 'appointment:delete',
  },
  USER: {
    INVITE: 'user:invite',
    DISABLE: 'user:disable',
    ENABLE: 'user:enable',
    ASSIGN_ROLE: 'user:assign_role',
  },
} as const;
