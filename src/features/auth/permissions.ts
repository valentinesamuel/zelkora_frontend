/**
 * The registered permission names this frontend gates on. Each value is a
 * `resource:action` string the backend enforces.
 *
 * PATIENT: mirrors zelkora_backend/migrations/000007_seed_patient_permissions.up.sql
 * — seeded in the `permissions` table. This block grows one resource entry per
 * future seed migration; it is not hand-extended speculatively ahead of what is
 * seeded.
 *
 * BRANCH: sourced from ENFORCED ROUTE MIDDLEWARE, not a seed migration.
 * `zelkora_backend/internal/branch/routes.go` guards every `/branches` route
 * with `auth.RequirePermission(...)`, and the constants are defined in
 * `zelkora_backend/internal/auth/permission.go:39-42`. No `permissions` row and
 * no `role_permissions` link is seeded for `branch:*` (tracked as H-3), so
 * server-side only the `admin` role (`*:*`, migration 000001) satisfies these
 * today; every other role gets 403. Listed here regardless because
 * `RequiredPermission` is derived from this object (`authorize.ts:22`) and
 * `Can permission={['branch:create']}` would not compile without it. DELETE is
 * omitted deliberately — there is no DELETE route and no delete UI (INV-B2).
 *
 * STAFF / USER: seeded in
 * `zelkora_backend/migrations/000009_seed_staff_user_permissions.up.sql` and
 * defined in `zelkora_backend/internal/auth/permission.go`. `staff:delete` and
 * `user:*` beyond invite/disable are omitted — no route and no UI for them.
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
  USER: { INVITE: 'user:invite', DISABLE: 'user:disable' },
} as const;
