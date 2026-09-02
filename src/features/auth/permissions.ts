/**
 * Mirrors zelkora_backend/migrations/000007_seed_patient_permissions.up.sql.
 * Grows one resource block per future seed migration — not hand-extended
 * speculatively ahead of what's actually seeded in the `permissions` table.
 */
export const PERMISSIONS = {
  PATIENT: {
    CREATE: 'patient:create',
    READ: 'patient:read',
    UPDATE: 'patient:update',
    DELETE: 'patient:delete',
  },
} as const;
