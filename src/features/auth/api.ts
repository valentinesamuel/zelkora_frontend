// Thin typed wrappers over `apiRequest` (INV-14: all HTTP goes through the
// single seam). No logic here beyond method/path/option selection.

import { apiRequest } from '../../lib/apiClient';
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

export function getMe(): Promise<User> {
  return apiRequest<User>('/auth/me');
}
