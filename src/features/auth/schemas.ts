/**
 * Client-side auth validation schemas.
 *
 * These schemas are a STRICT SUBSET MIRROR of the backend REQUEST binding tags
 * in `zelkora_backend/internal/auth/dto.go` (verified 2026-09-02). The backend
 * is authoritative. Never add a rule the backend does not enforce — a client
 * rule stricter than the server is a lockout (INV-A2).
 *
 * Request vs response polarity: this file mirrors REQUEST bodies and INV-A2
 * applies. The `MeResponse` mirror lives in `./me.schema.ts` — a RESPONSE
 * schema, where strictness on identity fields is correct and INV-A2 does NOT
 * apply (INV-P10).
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
 *   AcceptInviteRequest.Token          required
 *   AcceptInviteRequest.NewPassword    required,min=8
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

// `token` is not part of this schema: it comes from the URL, not the form.
// `confirm` is a CLIENT-ONLY UX field — it is never sent, so a cross-field
// match refine does not violate INV-A2. `newPassword` carries `min(8)` and
// nothing more, exactly mirroring the backend binding tag.
export const acceptInviteSchema = z
  .object({
    newPassword: z.string().min(8, 'Use at least 8 characters.'),
    confirm: z.string().min(1, 'Re-enter the password.'),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });

export type CredentialsValues = z.infer<typeof credentialsSchema>;
export type VerifyMfaValues = z.infer<typeof verifyMfaSchema>;
export type EnrollVerifyValues = z.infer<typeof enrollVerifySchema>;
export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>;
