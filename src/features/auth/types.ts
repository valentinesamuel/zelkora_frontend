// Auth feature contract types. Mirrors the backend HTTP contract exactly; see
// plan.md PHASE F3 "Rehydration context" for the endpoint reference.

// `admin` is retained as a render-layer alias of `cmo` (not renamed, not
// removed — the backend still issues it). `hospital_admin` / `clinical_lead`
// follow when their dashboards exist.
export type Role = 'admin' | 'cmo' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  branchId: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// POST /auth/login always returns HTTP 200. Discriminate ONLY on
// `requiresEnrollment` (INV-7): true -> `enrollmentToken` present; false ->
// `preAuthToken` present.
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
