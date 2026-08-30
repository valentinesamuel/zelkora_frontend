export enum RoleEnum {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
  PHARMACIST = 'pharmacist',
}

/** Alias for annotations; identical to {@link RoleEnum}. */
export type Role = RoleEnum;

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

export enum AuthStatusEnum {
  LOADING = 'loading',
  AUTHED = 'authed',
  ANON = 'anon',
}

/** Alias for annotations; identical to {@link AuthStatusEnum}. */
export type AuthStatus = AuthStatusEnum;
