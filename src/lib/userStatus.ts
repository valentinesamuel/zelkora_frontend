// Shared display helpers for a user's auth account status. Mirrors
// zelkora_backend/internal/auth/model.go Status* constants.
//
// Lives here (not under a feature) because it's rendered from two unrelated
// features: the staff list's Status column and the role detail's "Staff with
// this role" section (`RoleForm`) — neither feature owns the other.

export type UserStatus = 'invited' | 'pending_mfa' | 'active' | 'disabled';

const STATUS_LABELS: Record<UserStatus, string> = {
  invited: 'Invited',
  pending_mfa: 'Pending MFA',
  active: 'Active',
  disabled: 'Disabled',
};

type StatusBadgeVariant = 'success' | 'outline' | 'warning' | 'danger';

const STATUS_BADGE_VARIANTS: Record<UserStatus, StatusBadgeVariant> = {
  invited: 'outline',
  pending_mfa: 'warning',
  active: 'success',
  disabled: 'danger',
};

function isUserStatus(value: string): value is UserStatus {
  return Object.hasOwn(STATUS_LABELS, value);
}

/** Human label for a status string. Falls back to the raw value for a status
 * the frontend doesn't recognize yet, rather than hiding it. */
export function userStatusLabel(status: string): string {
  if (isUserStatus(status)) return STATUS_LABELS[status];
  return status;
}

/** Badge variant for a status string. Falls back to 'neutral' for an
 * unrecognized status. */
export function userStatusBadgeVariant(
  status: string,
): StatusBadgeVariant | 'neutral' {
  if (isUserStatus(status)) return STATUS_BADGE_VARIANTS[status];
  return 'neutral';
}
