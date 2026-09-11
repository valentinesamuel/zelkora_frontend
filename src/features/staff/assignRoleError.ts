import { ApiError } from '@/lib/apiClient';
import { apiErrorMessage } from '@/lib/formErrors';

// The two sentinel statuses of the assign-role flow
// (internal/auth/handler.go `writeAssignRoleError`). The 401 case is NOT
// here: a re-scope 401 is indistinguishable from an expired-token 401 and is
// already replayed transparently by `apiRequest` (INV-13).
//
// Shared by `StaffRoleDialog` and `StaffEditPage` — both call
// `useAssignStaffRole` and need the same error mapping. Lives in its own
// module (not a component file) so it can be exported without tripping
// `react-refresh/only-export-components`.
export function assignErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.statusCode === 409) {
    return 'Cannot remove the last administrator';
  }
  if (err instanceof ApiError && err.statusCode === 404) {
    return 'User or role no longer exists';
  }
  return apiErrorMessage(err, 'Could not update the role. Please try again.');
}
