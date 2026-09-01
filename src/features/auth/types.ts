export type Role = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist';
export const ROLE_VALUES: readonly Role[] = [
  'admin',
  'doctor',
  'nurse',
  'receptionist',
  'pharmacist',
];

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  branchId: string | null;
  permissions?: string[];
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
