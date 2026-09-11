/**
 * Mechanical enforcement of the third leg of the three-way vocabulary lockstep:
 * migration seed <-> `authz.Permission` (Go) <-> `PERMISSIONS` (here).
 *
 * The first two legs are proved by
 * `zelkora_backend/internal/platform/authz/authz_seed_sync_test.go`. This file
 * proves the third against `SEEDED_PERMISSION_NAMES` below — a checked-in
 * mirror of the backend seed migrations, because a browser-side test cannot
 * read the Go repo's `.sql` files.
 *
 * DIRECTION MATTERS. The assertion is a SUBSET, not an equality:
 *
 *     { every PERMISSIONS.*.* value }  ⊆  { every seeded permission name }
 *
 * Equality would be permanently red, and correctly so — three names are seeded
 * on purpose but deliberately absent from `PERMISSIONS`:
 *
 *   - `*:*`            the superuser permission. Never attachable, never a
 *                      gating constant (INV-12). Filtered out in three
 *                      independent places, `groupPermissions()` being one.
 *   - `branch:delete`  seeded by migration 000011 (fixing H-3), but there is
 *                      no DELETE route and no delete UI, so exposing it here
 *                      would create a `Can` surface with nothing behind it.
 *   - `staff:delete`   not seeded at all, and not in `PERMISSIONS` either —
 *                      listed here only to record that its absence from both
 *                      sides is intentional, not an oversight.
 *
 * So the direction this test runs in is the one that catches the dangerous
 * mistake: a `PERMISSIONS` entry that no migration seeds. Such an entry gates
 * UI on a permission no role can ever hold, and the feature is invisible to
 * everyone but `admin` — the frontend twin of backend bug H-3. The reverse
 * direction (a seeded name with no `PERMISSIONS` entry) is the normal,
 * expected state for any permission the UI does not yet gate on, and is
 * asserted here only for the two names above, so that removing their
 * deliberate omission is a conscious edit rather than a silent one.
 */
import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from './permissions';

/**
 * Mirror of every `INSERT INTO permissions` row across the backend's seed
 * migrations. Keep in lockstep when a seed migration is added:
 *
 *   000001_init_auth_rbac                 `*:*`
 *   000007_seed_patient_permissions       patient:*
 *   000009_seed_staff_user_permissions    staff:*, user:invite, user:disable
 *   000011_seed_role_branch_permissions   branch:*, role:*, user:assign_role
 */
const SEEDED_PERMISSION_NAMES: readonly string[] = [
  // 000001_init_auth_rbac.up.sql
  '*:*',
  // 000007_seed_patient_permissions.up.sql
  'patient:create',
  'patient:read',
  'patient:update',
  'patient:delete',
  // 000009_seed_staff_user_permissions.up.sql
  'staff:create',
  'staff:read',
  'staff:update',
  'user:invite',
  'user:disable',
  // 000011_seed_role_branch_permissions.up.sql
  'branch:create',
  'branch:read',
  'branch:update',
  'branch:delete',
  'role:create',
  'role:read',
  'role:update',
  'role:delete',
  'user:assign_role',
];

/** Seeded but deliberately not exposed as a `PERMISSIONS` constant. */
const DELIBERATELY_OMITTED_FROM_PERMISSIONS: readonly string[] = [
  '*:*',
  'branch:delete',
];

/** Flattens `PERMISSIONS` to `[dotted.path, value]` pairs so a failure names
 *  the offending constant, not just its string value. */
function permissionEntries(): Array<[string, string]> {
  return Object.entries(PERMISSIONS).flatMap(([group, actions]) =>
    Object.entries(actions).map(
      ([action, value]) => [`${group}.${action}`, value] as [string, string],
    ),
  );
}

describe('PERMISSIONS <-> backend seed lockstep', () => {
  it('is a subset of the seeded permission names', () => {
    const seeded = new Set(SEEDED_PERMISSION_NAMES);

    const unseeded = permissionEntries()
      .filter(([, value]) => !seeded.has(value))
      .map(([path, value]) => `${path} = ${value}`);

    expect(
      unseeded,
      'PERMISSIONS entries with no seeded permissions row — UI gated on these is invisible to every role but admin',
    ).toEqual([]);
  });

  it('extracted a plausible number of constants and seed names', () => {
    // Floors, not exact counts: a flattening bug that produced an empty list
    // would make the subset assertion above vacuously true.
    expect(permissionEntries().length).toBeGreaterThanOrEqual(15);
    expect(SEEDED_PERMISSION_NAMES.length).toBeGreaterThanOrEqual(19);
  });

  it('never exposes the `*:*` superuser permission', () => {
    const wildcards = permissionEntries().filter(
      ([, value]) => value === '*:*',
    );
    expect(wildcards, 'INV-12: `*:*` must never be a gating constant').toEqual(
      [],
    );
  });

  it('keeps the deliberate omissions omitted', () => {
    const values = new Set(permissionEntries().map(([, value]) => value));

    for (const omitted of DELIBERATELY_OMITTED_FROM_PERMISSIONS) {
      expect(
        values.has(omitted),
        `${omitted} is seeded but intentionally absent from PERMISSIONS — see this file's doc comment before adding it`,
      ).toBe(false);
    }
  });

  it('does not expose staff:delete, which is not seeded either', () => {
    const values = new Set(permissionEntries().map(([, value]) => value));
    expect(values.has('staff:delete')).toBe(false);
    expect(SEEDED_PERMISSION_NAMES).not.toContain('staff:delete');
  });

  it('has no duplicate values in the checked-in seed mirror', () => {
    expect(new Set(SEEDED_PERMISSION_NAMES).size).toBe(
      SEEDED_PERMISSION_NAMES.length,
    );
  });
});
