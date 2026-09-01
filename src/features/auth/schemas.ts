/**
 * Client-side auth validation schemas.
 *
 * These schemas are a STRICT SUBSET MIRROR of the backend binding tags in
 * `zelkora_backend/internal/auth/dto.go` (verified 2026-08-27). The backend is
 * authoritative. Never add a rule the backend does not enforce — a client rule
 * stricter than the server is a lockout (INV-A2).
 *
 * In particular: `passcode` is `binding:"required"` only; there is NO 6-digit
 * rule, no length rule, no charset rule. TOTP shape is validated by
 * `totp.Validate` in the service layer and surfaces to the client as the error
 * message `invalid mfa code`.
 *
 * Observed backend binding tags:
 *   LoginRequest.Email                 required,email
 *   LoginRequest.Password              required
 *   VerifyMFALoginRequest.Passcode     required
 *   VerifyMFAEnrollmentRequest.Passcode required
 */
import { z } from 'zod';

const passcodeField = z.string().min(1, 'Enter the code.');

export const credentialsSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const verifyMfaSchema = z.object({ passcode: passcodeField });

export const enrollVerifySchema = z.object({ passcode: passcodeField });

export type CredentialsValues = z.infer<typeof credentialsSchema>;
export type VerifyMfaValues = z.infer<typeof verifyMfaSchema>;
export type EnrollVerifyValues = z.infer<typeof enrollVerifySchema>;
