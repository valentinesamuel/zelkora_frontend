export interface User {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  branchId: string | null;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  requiresEnrollment: boolean;
  preAuthToken?: string;
  enrollmentToken?: string;
}

export interface EnrollMfaResult {
  secret: string;
  otpAuthUrl: string;
}

export interface VerifyMfaRequest {
  preAuthToken: string;
  passcode: string;
  deviceLabel: string;
}

export interface VerifyMfaResult {
  accessToken: string;
}

export interface RefreshResult {
  accessToken: string;
}

export type AuthStatus = 'loading' | 'authed' | 'anon';
export const AUTH_STATUS_VALUES: readonly AuthStatus[] = [
  'loading',
  'authed',
  'anon',
];
