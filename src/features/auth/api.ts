// Thin typed wrappers over `apiRequest` (INV-14: all HTTP goes through the
// single seam). No logic here beyond method/path/option selection.

import { apiRequest } from '../../lib/apiClient';
import { meResponseSchema } from './me.schema';
import type {
  EnrollMfaResult,
  LoginRequest,
  LoginResult,
  RefreshResult,
  User,
  VerifyMfaRequest,
  VerifyMfaResult,
} from './types';

export function login(body: LoginRequest): Promise<LoginResult> {
  return apiRequest<LoginResult>('/auth/login', { method: 'POST', body });
}

// `skipRefreshRetry: true`: a 401 here means the ENROLLMENT token expired, and
// there is no session cookie to refresh — a retry would be noise and would
// incorrectly fire `onAuthFailure`.
export function enrollMfa(enrollmentToken: string): Promise<EnrollMfaResult> {
  return apiRequest<EnrollMfaResult>('/auth/mfa/enroll', {
    method: 'POST',
    token: enrollmentToken,
    skipRefreshRetry: true,
  });
}

export async function verifyEnroll(
  enrollmentToken: string,
  passcode: string,
): Promise<void> {
  await apiRequest<null>('/auth/mfa/enroll/verify', {
    method: 'POST',
    body: { passcode },
    token: enrollmentToken,
    skipRefreshRetry: true,
  });
}

// Public endpoint: the invite token IS the credential and travels in the body,
// so no Authorization header and no refresh retry (a 401/400 here means the
// invite is spent or expired, not that a session lapsed).
export async function acceptInvite(
  token: string,
  newPassword: string,
): Promise<void> {
  await apiRequest<null>('/auth/invite/accept', {
    method: 'POST',
    body: { token, newPassword },
    skipAuth: true,
    skipRefreshRetry: true,
  });
}

export function verifyMfa(body: VerifyMfaRequest): Promise<VerifyMfaResult> {
  return apiRequest<VerifyMfaResult>('/auth/mfa/verify', {
    method: 'POST',
    body,
  });
}

export function refresh(): Promise<RefreshResult> {
  return apiRequest<RefreshResult>('/auth/refresh', {
    method: 'POST',
    skipAuth: true,
    skipRefreshRetry: true,
  });
}

export async function logout(): Promise<void> {
  await apiRequest<null>('/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<User> {
  const raw = await apiRequest<unknown>('/auth/me');
  // Strict on identity fields (throws → authStore fails closed, INV-P12);
  // `permissions` collapses to [] on skew (INV-P4). Return type enforces the
  // schema output is assignable to `User`.
  if (
    import.meta.env.DEV &&
    (typeof raw !== 'object' || raw === null || !('permissions' in raw))
  ) {
    console.warn(
      '[getMe] /auth/me response has no `permissions` key — backend may predate EXT-BE-PERMS; every permission gate will deny',
    );
  }
  return meResponseSchema.parse(raw);
}
